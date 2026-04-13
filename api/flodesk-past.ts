/**
 * POST /api/flodesk-past
 * Captures workbook gate submissions and adds the subscriber to the Flodesk PAST segment.
 *
 * Required env vars:
 *   FLODESK_API_KEY             - Flodesk API key
 *
 * Optional env vars:
 *   FLODESK_PAST_SEGMENT_ID     - Preferred explicit segment ID for PAST
 *   FLODESK_PAST_SEGMENT_NAME   - Segment name lookup fallback (default: PAST)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SegmentLike {
  id?: string;
  name?: string;
}

function normalizeSegmentId(rawValue: string | undefined): string | null {
  if (!rawValue) return null;

  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/\/segment\/([^/?#]+)/i);
  if (urlMatch) return urlMatch[1];

  return trimmed;
}

function parseSegments(payload: unknown): SegmentLike[] {
  if (Array.isArray(payload)) return payload as SegmentLike[];

  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p['data'])) return p['data'] as SegmentLike[];
    if (Array.isArray(p['segments'])) return p['segments'] as SegmentLike[];
  }

  return [];
}

async function resolvePastSegmentId(apiKey: string): Promise<string> {
  const explicit = normalizeSegmentId(process.env.FLODESK_PAST_SEGMENT_ID);
  if (explicit) return explicit;

  const targetName = (process.env.FLODESK_PAST_SEGMENT_NAME || 'PAST').trim().toLowerCase();
  const res = await fetch('https://api.flodesk.com/v1/segments', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch Flodesk segments (${res.status}): ${text}`);
  }

  const payload = (await res.json()) as unknown;
  const segments = parseSegments(payload);
  const match = segments.find(
    (segment) =>
      typeof segment?.name === 'string' && segment.name.trim().toLowerCase() === targetName
  );

  if (!match?.id) {
    throw new Error(`Could not find Flodesk segment named "${targetName.toUpperCase()}"`);
  }

  return match.id;
}

function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: '', lastName: '' };

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' '),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email } = (req.body ?? {}) as {
    name?: string;
    email?: string;
  };

  const safeName = (name || '').trim();
  const safeEmail = (email || '').trim().toLowerCase();

  if (!safeName) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!safeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const apiKey = process.env.FLODESK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Flodesk is not configured yet' });
  }

  try {
    const segmentId = await resolvePastSegmentId(apiKey);
    const { firstName, lastName } = splitName(safeName);

    const addRes = await fetch('https://api.flodesk.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: safeEmail,
        first_name: firstName,
        last_name: lastName,
        segment_ids: [segmentId],
      }),
    });

    if (!addRes.ok) {
      const text = await addRes.text();
      return res.status(502).json({ error: `Failed to add to Flodesk PAST segment: ${text}` });
    }

    return res.status(200).json({ ok: true, segmentId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Flodesk error';
    return res.status(502).json({ error: message });
  }
}
