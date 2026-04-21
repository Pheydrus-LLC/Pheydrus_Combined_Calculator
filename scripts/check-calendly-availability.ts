import { config as loadDotenv } from 'dotenv';

/**
 * Checks Calendly availability for the next 4 days.
 * If no slots are available, posts a Slack alert mentioning a contact.
 *
 * Usage:
 *   npm run calendly:check -- <calendly_user_url> [--contact "@john"]
 *
 * Required env vars:
 *   CALENDLY_API_TOKEN           — Personal access token from Calendly
 *   SLACK_ALERT_WEBHOOK_URL      — Dedicated webhook for Calendly alerts (recommended)
 *   SLACK_WEBHOOK_URL or
 *   SLACK_TRANSCRIPT_WEBHOOK_URL — Fallback webhooks for posting alerts
 *
 * Optional env vars:
 *   CALENDLY_EVENT_URL           — Default Calendly event URL to check
 *   CALENDLY_CONTACT_SLACK_IDS   — Comma-separated Slack mentions or user IDs to ping
 *   CALENDLY_CONTACT_SLACK_ID    — Legacy single contact mention
 *   SLACK_ALERT_CHANNEL          — Channel to post to (defaults to general)
 */

async function loadEnv(): Promise<void> {
  loadDotenv({ path: '.env.local', override: false });
  loadDotenv({ path: '.env', override: false });
}

interface CalendlyEvent {
  uri: string;
  name: string;
  slug?: string;
  scheduling_url?: string;
  available_periods: Array<{
    start: string;
    end: string;
  }>;
}

function matchesCalendlyEvent(eventType: CalendlyEvent, eventSlug: string): boolean {
  return (
    eventType.slug === eventSlug ||
    eventType.scheduling_url?.includes(`/${eventSlug}`) ||
    eventType.uri.includes(eventSlug)
  );
}

interface ParsedArgs {
  calendlyUrl: string;
  contacts?: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const defaultCalendlyUrl = process.env.CALENDLY_EVENT_URL;
  const firstArg = argv[0];
  const calendlyUrl = firstArg && !firstArg.startsWith('--') ? firstArg : defaultCalendlyUrl;

  if (!calendlyUrl) {
    console.error('ERROR: Missing Calendly event URL argument');
    console.error('Usage: npm run calendly:check -- [<calendly_url>] [--contact "@mention1,@mention2"]');
    console.error('Or set CALENDLY_EVENT_URL in .env.local');
    process.exit(1);
  }

  const result: ParsedArgs = {
    calendlyUrl,
  };

  for (let i = firstArg && !firstArg.startsWith('--') ? 1 : 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    const next = argv[i + 1];

    if (arg === '--contact' && next) {
      result.contacts = next
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      i += 1;
    }
  }

  return result;
}

async function getCalendlyEventUri(calendarUrl: string): Promise<string> {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    throw new Error('Missing CALENDLY_API_TOKEN env var');
  }

  // Extract username from URL (e.g., https://calendly.com/username/event -> username)
  const urlMatch = calendarUrl.match(/calendly\.com\/([^/]+)(?:\/(.+))?/);
  if (!urlMatch) {
    throw new Error(`Invalid Calendly URL: ${calendarUrl}`);
  }

  const [, , eventSlug] = urlMatch;

  // Get user UUID
  const userRes = await fetch('https://api.calendly.com/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) {
    throw new Error(`Calendly API error (${userRes.status}): ${await userRes.text()}`);
  }

  const userData = (await userRes.json()) as { resource: { uri: string; current_organization?: string } };
  const userUri = userData.resource.uri;
  const organizationUri = userData.resource.current_organization;

  if (eventSlug && organizationUri) {
    const orgEventsRes = await fetch(
      `https://api.calendly.com/event_types?organization=${encodeURIComponent(organizationUri)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (orgEventsRes.ok) {
      const orgEventsData = (await orgEventsRes.json()) as { collection: CalendlyEvent[] };
      const orgEvent = orgEventsData.collection.find((eventType) =>
        matchesCalendlyEvent(eventType, eventSlug)
      );

      if (orgEvent) {
        return orgEvent.uri;
      }
    }
  }

  // Fall back to personal event types.
  const eventsRes = await fetch(`https://api.calendly.com/event_types?user=${userUri}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!eventsRes.ok) {
    throw new Error(`Calendly API error (${eventsRes.status}): ${await eventsRes.text()}`);
  }

  const eventsData = (await eventsRes.json()) as { collection: CalendlyEvent[] };
  const targetEvent = eventSlug
    ? eventsData.collection.find((eventType) => matchesCalendlyEvent(eventType, eventSlug))
    : eventsData.collection[0];

  if (!targetEvent) {
    throw new Error(`Event not found for URL: ${calendarUrl}`);
  }

  return targetEvent.uri;
}

async function checkAvailability(eventUri: string): Promise<boolean> {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    throw new Error('Missing CALENDLY_API_TOKEN env var');
  }

  // Get next 4 days
  const now = new Date(Date.now() + 60 * 1000);
  const startTime = now.toISOString();
  const endDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const endTime = endDate.toISOString();

  // Check event availability
  const query = new URLSearchParams({
    event_type: eventUri,
    start_time: startTime,
    end_time: endTime,
  });

  const availRes = await fetch(`https://api.calendly.com/event_type_available_times?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!availRes.ok) {
    const text = await availRes.text();
    console.warn(`Calendly API warning (${availRes.status}): ${text}`);
    return true; // Assume available on API error to avoid false alarms
  }

  const availData = (await availRes.json()) as { collection?: Array<{ start_time: string }> };
  const hasAvailability = (availData.collection?.length || 0) > 0;

  return hasAvailability;
}

async function postToSlack(eventUrl: string, contacts: string[] | null): Promise<void> {
  const webhookUrl =
    process.env.SLACK_ALERT_WEBHOOK_URL ||
    process.env.SLACK_WEBHOOK_URL ||
    process.env.SLACK_TRANSCRIPT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[calendly:check] No Slack webhook configured; skipping alert');
    return;
  }

  const formatSlackMention = (value: string): string => {
    const trimmed = value.trim();
    if (/^[UW][A-Z0-9]+$/.test(trimmed)) {
      return `<@${trimmed}>`;
    }
    return trimmed;
  };

  const channel = process.env.SLACK_ALERT_CHANNEL || '#calendar-alerts';
  const configuredContacts = process.env.CALENDLY_CONTACT_SLACK_IDS
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const mentions = contacts && contacts.length > 0
    ? contacts
    : configuredContacts && configuredContacts.length > 0
      ? configuredContacts
      : process.env.CALENDLY_CONTACT_SLACK_ID
        ? [process.env.CALENDLY_CONTACT_SLACK_ID]
        : ['@here'];
  const mentionText = mentions.map(formatSlackMention).join(' ');

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '⚠️ Calendly No Availability Alert', emoji: true },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${mentionText}\n\n*No availability for the next 4 days*\n\n<${eventUrl}|View Calendly>`,
      },
    },
  ];

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, blocks }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Slack post failed (${res.status}): ${text}`);
  }

  if (!process.env.SLACK_ALERT_WEBHOOK_URL) {
    console.warn(
      '[calendly:check] Using fallback webhook. If alerts still land in #video-transcripts, create a dedicated incoming webhook for #hj-booked-calls and set SLACK_ALERT_WEBHOOK_URL.'
    );
  }

  console.log('[calendly:check] Alert posted to Slack');
}

async function main(): Promise<void> {
  await loadEnv();

  const args = parseArgs(process.argv.slice(2));
  const token = process.env.CALENDLY_API_TOKEN;

  if (!token) {
    throw new Error('Add CALENDLY_API_TOKEN to .env file first (get it from Calendly account settings)');
  }

  console.log('[calendly:check] Checking availability...');

  const eventUri = await getCalendlyEventUri(args.calendlyUrl);
  const hasAvailability = await checkAvailability(eventUri);

  if (hasAvailability) {
    console.log('✅ Calendar has availability');
  } else {
    console.log('⚠️ No availability in next 4 days - posting Slack alert');
    await postToSlack(args.calendlyUrl, args.contacts || null);
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ ERROR: ${message}`);
  process.exit(1);
});
