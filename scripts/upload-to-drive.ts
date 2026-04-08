import fs from 'node:fs';
import path from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { google } from 'googleapis';

function usageAndExit(message?: string): never {
  if (message) console.error(`ERROR: ${message}`);
  console.error('Usage: npx tsx scripts/upload-to-drive.ts <local_file_path> <drive_folder_id>');
  process.exit(1);
}

async function main(): Promise<void> {
  const [fileArg, folderId] = process.argv.slice(2);
  if (!fileArg || !folderId) usageAndExit('Missing required arguments.');

  loadDotenv({ path: '.env.local', override: false });
  loadDotenv({ path: '.env', override: false });

  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) usageAndExit(`File not found: ${filePath}`);

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    usageAndExit('Missing Google OAuth env vars (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN).');
  }

  const auth = new google.auth.OAuth2({ clientId, clientSecret });
  auth.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth });
  const response = await drive.files.create({
    requestBody: {
      name: path.basename(filePath),
      parents: [folderId],
    },
    media: {
      mimeType: 'video/mp4',
      body: fs.createReadStream(filePath),
    },
    fields: 'id,name,webViewLink,webContentLink',
  });

  const file = response.data;
  console.log('UPLOAD_OK');
  console.log(`ID=${file.id || ''}`);
  console.log(`NAME=${file.name || ''}`);
  console.log(`WEB_VIEW=${file.webViewLink || ''}`);
  console.log(`WEB_CONTENT=${file.webContentLink || ''}`);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`ERROR: ${message}`);
  process.exit(1);
});
