/**
 * drive-to-youtube.ts
 *
 * Downloads videos from a Google Drive folder (or individual file links) and
 * uploads each one to YouTube as Unlisted.
 *
 * Usage:
 *   npm run youtube:upload -- <drive_folder_or_file_url> [more_urls...]
 *
 * Required env vars:
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   GOOGLE_YOUTUBE_REFRESH_TOKEN   ← from `npm run youtube:auth`
 *
 * Optional env vars:
 *   YOUTUBE_CATEGORY_ID   — default 27 (Education)
 *   YOUTUBE_DESCRIPTION   — default empty
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { config as loadDotenv } from 'dotenv';
import { google } from 'googleapis';

loadDotenv({ path: '.env.local', override: false });
loadDotenv({ path: '.env', override: false });

// ── Auth ──────────────────────────────────────────────────────────────────────

function buildClients() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const driveRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const youtubeRefreshToken = process.env.GOOGLE_YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET');
  }
  if (!youtubeRefreshToken) {
    throw new Error('Missing GOOGLE_YOUTUBE_REFRESH_TOKEN. Run `npm run youtube:auth` first.');
  }

  const driveAuth = new google.auth.OAuth2({ clientId, clientSecret });
  driveAuth.setCredentials({ refresh_token: driveRefreshToken || youtubeRefreshToken });

  const ytAuth = new google.auth.OAuth2({ clientId, clientSecret });
  ytAuth.setCredentials({ refresh_token: youtubeRefreshToken });

  return {
    drive: google.drive({ version: 'v3', auth: driveAuth }),
    youtube: google.youtube({ version: 'v3', auth: ytAuth }),
  };
}

// ── Drive helpers ─────────────────────────────────────────────────────────────

function extractDriveId(raw: string): string {
  const fileMatch = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch?.[1]) return fileMatch[1];
  const folderMatch = raw.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) return folderMatch[1];
  return raw.trim();
}

interface DriveFile { id: string; name: string; mimeType: string; }

async function resolveFiles(
  drive: ReturnType<typeof google.drive>,
  driveId: string
): Promise<DriveFile[]> {
  let meta;
  try {
    meta = await drive.files.get({
      fileId: driveId,
      fields: 'id, name, mimeType',
      supportsAllDrives: true,
    });
  } catch (e) {
    console.error(`  Drive API error: ${e instanceof Error ? e.message : e}`);
    return [{ id: driveId, name: 'video.mp4', mimeType: 'video/mp4' }];
  }

  if (meta.data.mimeType !== 'application/vnd.google-apps.folder') {
    return [{ id: meta.data.id!, name: meta.data.name!, mimeType: meta.data.mimeType! }];
  }

  const files: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const res = await drive.files.list({
      q: `'${driveId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 100,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      orderBy: 'name',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const f of res.data.files ?? []) {
      if (f.id && f.name && f.mimeType) files.push({ id: f.id, name: f.name, mimeType: f.mimeType });
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

async function downloadFile(
  drive: ReturnType<typeof google.drive>,
  fileId: string,
  destPath: string
): Promise<void> {
  try {
    const res = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );
    await new Promise<void>((resolve, reject) => {
      const dest = fs.createWriteStream(destPath);
      (res.data as NodeJS.ReadableStream).pipe(dest);
      dest.on('finish', resolve);
      dest.on('error', reject);
    });
    return;
  } catch {
    // fall through to public download
  }

  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const firstRes = await fetch(directUrl, { redirect: 'follow' });
  const contentType = firstRes.headers.get('content-type') ?? '';

  if (contentType.startsWith('video/')) {
    fs.writeFileSync(destPath, Buffer.from(await firstRes.arrayBuffer()));
    return;
  }

  const html = await firstRes.text();
  const confirmMatch = html.match(/name="confirm"\s+value="([^"]+)"/);
  const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/);

  const downloadUrl = confirmMatch?.[1] && uuidMatch?.[1]
    ? `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${confirmMatch[1]}&uuid=${uuidMatch[1]}`
    : `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;

  const fileRes = await fetch(downloadUrl, { redirect: 'follow' });
  if (!fileRes.ok) throw new Error(`Public download failed: HTTP ${fileRes.status}`);
  fs.writeFileSync(destPath, Buffer.from(await fileRes.arrayBuffer()));
}

// ── YouTube upload ────────────────────────────────────────────────────────────

async function uploadToYouTube(
  youtube: ReturnType<typeof google.youtube>,
  localPath: string,
  title: string,
): Promise<string> {
  const categoryId = process.env.YOUTUBE_CATEGORY_ID || '27';
  const description = process.env.YOUTUBE_DESCRIPTION || '';

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title, description, categoryId },
      status: { privacyStatus: 'unlisted' },
    },
    media: {
      body: fs.createReadStream(localPath),
    },
  });

  return res.data.id!;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function uploadFiles(
  youtube: ReturnType<typeof google.youtube>,
  drive: ReturnType<typeof google.drive>,
  files: DriveFile[],
  tmpDir: string,
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const ext = path.extname(file.name) || '.mp4';
    const localPath = path.join(tmpDir, `${i}_${file.id}${ext}`);
    const title = path.basename(file.name, ext).trim();

    process.stdout.write(`  [${i + 1}/${files.length}] ${file.name} — downloading...`);
    try {
      await downloadFile(drive, file.id, localPath);
      process.stdout.write(' uploading...');
      const videoId = await uploadToYouTube(youtube, localPath, title);
      console.log(` done → https://www.youtube.com/watch?v=${videoId}`);
      success++;
    } catch (err) {
      console.error(`\n    ERROR: ${err instanceof Error ? err.message : err}`);
      failed++;
    } finally {
      try { fs.unlinkSync(localPath); } catch { /* ignore */ }
    }
  }
  return { success, failed };
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);

  if (rawArgs[0] === '--files-json' && rawArgs[1]) {
    // Pre-built file list from Claude/MCP — bypasses Drive API
    // JSON format: [{ "id": "...", "name": "filename.mp4" }, ...]
    const files: DriveFile[] = JSON.parse(fs.readFileSync(rawArgs[1], 'utf8'))
      .map((f: { id: string; name: string; mimeType?: string }) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType ?? 'video/mp4',
      }));
    console.log(`Uploading ${files.length} file(s) from JSON list...`);
    const { drive, youtube } = buildClients();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-upload-'));
    const { success, failed } = await uploadFiles(youtube, drive, files, tmpDir);
    try { fs.rmdirSync(tmpDir); } catch { /* ignore */ }
    console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
    return;
  }

  if (rawArgs.length === 0) {
    console.error('Usage:\n  npm run youtube:upload -- <drive_folder_or_file_url> [more_urls...]\n  npm run youtube:upload -- --files-json <path/to/files.json>');
    process.exit(1);
  }

  const { drive, youtube } = buildClients();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-upload-'));
  let success = 0;
  let failed = 0;

  for (const rawArg of rawArgs) {
    const driveId = extractDriveId(rawArg);
    console.log(`\nResolving: ${rawArg}`);
    let files: DriveFile[];
    try {
      files = await resolveFiles(drive, driveId);
    } catch (err) {
      console.error(`  ERROR resolving files: ${err instanceof Error ? err.message : err}`);
      failed++;
      continue;
    }
    console.log(`  Found ${files.length} video(s)`);
    const result = await uploadFiles(youtube, drive, files, tmpDir);
    success += result.success;
    failed += result.failed;
  }

  try { fs.rmdirSync(tmpDir); } catch { /* ignore */ }
  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
