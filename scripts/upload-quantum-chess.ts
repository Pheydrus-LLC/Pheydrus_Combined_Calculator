/**
 * upload-quantum-chess.ts
 *
 * Uploads all 28 Quantum Chess Drive videos to YouTube (Pheydrus channel) as Unlisted.
 * File metadata sourced directly — bypasses Drive API auth.
 *
 * Usage:
 *   npm run youtube:upload-class
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { config as loadDotenv } from 'dotenv';
import { google } from 'googleapis';

loadDotenv({ path: '.env.local', override: false });
loadDotenv({ path: '.env', override: false });

const FILES = [
  { id: '1sYdp-X-e4GRSyX5cRzgQ_1vKuqF0OHxP', name: '1. No more gatekeeping.mp4' },
  { id: '1Tnjycc31GW_bEM6eEuNmY7KAlidNeBAm',  name: '2. What is astrocartography.mp4' },
  { id: '1QXforUGxApIdnWoMZKvNrUKKVw2KHOAN',  name: '3. Experience over Theory.mp4' },
  { id: '1E8-dhRhMG0JaDqgna-FqG5zbCLSXXSZ2',  name: '4. What we will actually focus on.mp4' },
  { id: '1lv4XZKwKMFz59zjbX5SsyKP1OaN2faKR',  name: '5. How quickly will I get results.mp4' },
  { id: '1Hlt8YBOlEYGwvibFkRsx2HTAgG5VzmUI',  name: '6. But I already moved v2.mp4' },
  { id: '1ovpfTg24I-rw5f63fhzKfNqOtWZVDdhG',  name: '7. Signs you need to move.mp4' },
  { id: '1CZ3idK6KPqdsjUPIkdGnfjNIw6ScgwbE',  name: '8. Our Ancestors Did It...But here\'s Why.mp4' },
  { id: '17JoQUk50Bu0s-c-Xvukw3XreXZabqt--',  name: '9. Environment x Our Brain.mp4' },
  { id: '1HekDT48q51G2zvEoavZ0k1HXAzQ0H3bx',  name: '10. Astrocartography is just rotating your chart.mp4' },
  { id: '1oTP6uedM8jbxmDZWvoHwXUsj6xR6NXvz',  name: '11. Astroseek.com.mp4' },
  { id: '1qQm6G2eDP44Yu75WQZ6viIW1PFR7FtJe',  name: '12. Pheydrus Relocation Calculator.mp4' },
  { id: '1hBpjUQRMtPXRhML2wUAM2jtk3xDUiojZ',  name: '13. My story.mp4' },
  { id: '1PpUbwV8jX_N9sDcTyYFnie8AnzJdbz2f',  name: '14. Angular houses.mp4' },
  { id: '1O2VH0qME2enJx_rEuXRSnXW-1JUYw1bF',  name: '15. Angular house GOAL nuances.mp4' },
  { id: '1kT-5MgWOH0-djt8633xjO12iFl-mBtob',  name: '16. Importance of Rising Signs.mp4' },
  { id: '1nggNK45T0EQOJz02Pw7tYu95pbSxeWay',  name: '17. Benefic Planets.mp4' },
  { id: '1U6qT3NhGQ4VR2VNN316xiQkF-xjQF0E4',  name: '18. Malefic Planets.mp4' },
  { id: '1htPtRunfOrf6_lT4Qlgv2EV8SBLLO0Os',  name: '19. Whole House vs. Placidus House.mp4' },
  { id: '1FWsoGNkwpENiZvWwEAVKjxM_nNtBmZ5i',  name: '20. NYC House vs Placidus.mp4' },
  { id: '1CJVwO5BQtx4F615VWj_tJqSAMJCApAwj',  name: '21. Austin House vs. Placidus.mp4' },
  { id: '19DjNLmQtTNzc2oXieZCrEp-PCmsMhgF1',  name: '22. Barceloa House vs. Placidus.mp4' },
  { id: '1woY8hMBOcNnNM1gofRHPLYYnI5YqStYH',  name: '23. SoCal House vs. Placidus.mp4' },
  { id: '1U7smH-X6_7olxkC5-V8T8E9wip2DYLoZ',  name: '24. 10x effect intro.mp4' },
  { id: '1K31kr9CSWPWeGy9qjFRRBrbFaw1LcuNf',  name: '25. 8th house.mp4' },
  { id: '1_j15AYX93Tf7VzFJHXuxDxZhUWfFq3lX',  name: '26. 11th house.mp4' },
  { id: '108e8fCqxke84MqSZ8uxhmifyHU_RwlXY',  name: '27. IC.mp4' },
  { id: '1gjaJanRT11JCsVi-uvhWNu5rlbqDCWyr',  name: '28. Jupiter x Pluto Conjunction.mp4' },
];

async function downloadFile(fileId: string, destPath: string): Promise<void> {
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
  if (!fileRes.ok) throw new Error(`Download failed: HTTP ${fileRes.status}`);
  fs.writeFileSync(destPath, Buffer.from(await fileRes.arrayBuffer()));
}

async function uploadToYouTube(
  youtube: ReturnType<typeof google.youtube>,
  localPath: string,
  title: string,
): Promise<string> {
  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title, description: '', categoryId: '27' },
      status: { privacyStatus: 'unlisted' },
    },
    media: { body: fs.createReadStream(localPath) },
  });
  return res.data.id!;
}

async function main(): Promise<void> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, or GOOGLE_YOUTUBE_REFRESH_TOKEN');
  }

  const auth = new google.auth.OAuth2({ clientId, clientSecret });
  auth.setCredentials({ refresh_token: refreshToken });
  const youtube = google.youtube({ version: 'v3', auth });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-qc-'));
  let success = 0;
  let failed = 0;

  for (let i = 0; i < FILES.length; i++) {
    const file = FILES[i]!;
    const ext = path.extname(file.name);
    const title = path.basename(file.name, ext).trim();
    const localPath = path.join(tmpDir, `${i}_${file.id}${ext}`);

    process.stdout.write(`[${i + 1}/${FILES.length}] ${file.name} — downloading...`);
    try {
      await downloadFile(file.id, localPath);
      process.stdout.write(' uploading...');
      const videoId = await uploadToYouTube(youtube, localPath, title);
      console.log(` done → https://www.youtube.com/watch?v=${videoId}`);
      success++;
    } catch (err) {
      console.error(`\n  ERROR: ${err instanceof Error ? err.message : err}`);
      failed++;
    } finally {
      try { fs.unlinkSync(localPath); } catch { /* ignore */ }
    }
  }

  try { fs.rmdirSync(tmpDir); } catch { /* ignore */ }
  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
