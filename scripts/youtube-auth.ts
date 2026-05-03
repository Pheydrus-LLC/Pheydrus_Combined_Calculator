/**
 * youtube-auth.ts
 *
 * One-time OAuth flow to get a refresh token with YouTube upload scope.
 * Run once, copy the printed GOOGLE_YOUTUBE_REFRESH_TOKEN into .env.local.
 *
 * Prerequisites:
 *   1. YouTube Data API v3 enabled in Google Cloud Console
 *   2. http://localhost:3000/oauth2callback added as an authorized redirect URI
 *      in your OAuth 2.0 client credentials
 *
 * Usage:
 *   npm run youtube:auth
 */

import http from 'node:http';
import { config as loadDotenv } from 'dotenv';
import { google } from 'googleapis';
import { spawn, execFileSync } from 'node:child_process';

loadDotenv({ path: '.env.local', override: false });
loadDotenv({ path: '.env', override: false });

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/youtube',
];

function openBrowser(url: string): void {
  try { execFileSync('pbcopy', [], { input: url }); } catch { /* clipboard unavailable */ }
  spawn('open', [url], { detached: true, stdio: 'ignore' });
}

async function main(): Promise<void> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('ERROR: GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set in .env.local');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\nOpening browser for Google authorization...');
  console.log('URL copied to clipboard. If the browser does not open, paste it manually:\n');
  console.log(authUrl);
  console.log('\nWaiting for authorization...\n');
  openBrowser(authUrl);

  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:${PORT}`);
      if (url.pathname !== '/oauth2callback') {
        res.writeHead(404);
        res.end();
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Authorization denied. You can close this tab.</h2>');
        server.close();
        reject(new Error(`Authorization denied: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h2>Missing code. Please try again.</h2>');
        return;
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Authorization successful! You can close this tab.</h2>');
        server.close();

        console.log('\n✓ Authorization successful!\n');
        console.log('Add this to your .env.local:\n');
        console.log(`GOOGLE_YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('');
        resolve();
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h2>Error exchanging code. Check the terminal.</h2>');
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, () => {
      // waiting for callback
    });

    server.on('error', reject);
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
