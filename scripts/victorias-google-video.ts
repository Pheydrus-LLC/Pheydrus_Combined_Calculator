import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

interface PipelineResult {
  sourceUrl: string;
  title: string;
  docUrl: string;
  captionedUrl: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function loadEnvFiles(): void {
  const candidates = [
    path.join(ROOT, '.env'),
    path.join(ROOT, '.env.local'),
    path.join(ROOT, 'transcribe-videos', '.env'),
    path.join(ROOT, 'transcribe-videos', '.env.local'),
    path.join(ROOT, 'transcribe-videos', '.env_1.example'),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      loadDotenv({ path: file, override: false });
    }
  }
}

function usageAndExit(message?: string): never {
  if (message) console.error(`ERROR: ${message}`);
  console.error('Usage: npm run "victorias google video" -- <drive_video_link> [more_links...]');
  process.exit(1);
}

function parseArgs(argv: string[]): { links: string[]; skipSlack: boolean } {
  const links: string[] = [];
  let skipSlack = false;

  for (const arg of argv) {
    if (arg === '--skip-slack') {
      skipSlack = true;
      continue;
    }
    links.push(arg);
  }

  if (links.length === 0) usageAndExit('Missing required Drive link(s).');
  return { links, skipSlack };
}

function runCommand(command: string): string {
  return execSync(command, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function parseCaptionedFileId(output: string): string {
  const matches = [...output.matchAll(/done \(([^)]+)\)/g)];
  if (!matches.length) {
    throw new Error('Could not find captioned file id in captions output.');
  }
  return matches[matches.length - 1]![1]!;
}

function parseTranscriptDocUrl(output: string): string {
  const match = output.match(/^Google Doc:\s+(https:\/\/\S+)$/m);
  if (!match?.[1]) {
    throw new Error('Could not find Google Doc URL in transcript output.');
  }
  return match[1];
}

function parseTitle(output: string): string {
  const match = output.match(/^Title Used:\s+(.+)$/m);
  return match?.[1]?.trim() || 'Video Transcript';
}

async function postConsolidatedSlack(result: PipelineResult): Promise<void> {
  const webhookUrl = process.env.SLACK_TRANSCRIPT_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[victorias google video] No Slack webhook set; skipping Slack post.');
    return;
  }

  const channel = process.env.SLACK_TRANSCRIPT_CHANNEL || '#video-transcripts';
  const payload = {
    channel,
    text: 'Complete Video Pipeline',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Complete Video Pipeline*\n*Title:* ${result.title}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            `Original Video:\n<${result.sourceUrl}|Open original Drive video>\n\n` +
            `Captioned Video:\n<${result.captionedUrl}|Open captioned video>\n\n` +
            `Transcript Doc:\n<${result.docUrl}|Open Google Doc>`,
        },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack post failed (${response.status}): ${text}`);
  }
}

async function processSingleLink(sourceUrl: string, skipSlack: boolean): Promise<PipelineResult> {
  console.log(`\n=== Processing ${sourceUrl} ===`);

  const captionOutput = runCommand(
    `npx tsx scripts/add-captions-to-drive-videos.ts "${sourceUrl.replace(/"/g, '\\"')}" 2>&1`
  );
  const captionedFileId = parseCaptionedFileId(captionOutput);
  const captionedUrl = `https://drive.google.com/file/d/${captionedFileId}/view`;

  const transcriptOutput = runCommand(
    `npx tsx scripts/transcript-to-gdoc-slack.ts "${sourceUrl.replace(/"/g, '\\"')}" --no-slack 2>&1`
  );
  const docUrl = parseTranscriptDocUrl(transcriptOutput);
  const title = parseTitle(transcriptOutput);

  const result: PipelineResult = {
    sourceUrl,
    title,
    docUrl,
    captionedUrl,
  };

  if (!skipSlack) {
    await postConsolidatedSlack(result);
  }

  return result;
}

async function main(): Promise<void> {
  loadEnvFiles();
  const { links, skipSlack } = parseArgs(process.argv.slice(2));

  const results: PipelineResult[] = [];
  let failures = 0;

  for (const link of links) {
    try {
      const result = await processSingleLink(link, skipSlack);
      results.push(result);
      console.log(`OK: ${result.title}`);
      console.log(`Original:  ${result.sourceUrl}`);
      console.log(`Captioned: ${result.captionedUrl}`);
      console.log(`Doc:       ${result.docUrl}`);
      console.log(skipSlack ? 'Slack:     skipped (--skip-slack)' : 'Slack:     posted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`FAILED: ${link}`);
      console.error(msg);
      failures += 1;
    }
  }

  console.log(`\nDone. ${results.length} succeeded, ${failures} failed.`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(msg);
  process.exit(1);
});
