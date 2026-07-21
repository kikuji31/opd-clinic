// Standalone diagnostic — run with: node lib/checkDriveConnection.js
// Reads the same env vars as the app and reports exactly where the Drive
// connection is broken, instead of the silent failure app.js does on purpose.
require('dotenv').config();
const { google } = require('googleapis');

const required = ['GOOGLE_SERVICE_ACCOUNT_KEY', 'GOOGLE_DRIVE_FOLDER_ID'];

async function main() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error('[FAIL] Missing env vars:', missing.join(', '));
    console.error('       Set these in your .env (local) or your host\'s env var dashboard (e.g. Vercel).');
    process.exit(1);
  }
  console.log('[OK] All required env vars are set.');

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth });

  console.log('[..] Trying to get an access token for the service account...');
  try {
    await auth.getAccessToken();
    console.log('[OK] Service account key is valid — got a fresh access token.');
  } catch (err) {
    console.error('[FAIL] Could not get access token:', err.response?.data || err.message);
    console.error('       Most common cause: the key was revoked, or GOOGLE_SERVICE_ACCOUNT_KEY');
    console.error('       isn\'t valid JSON.');
    process.exit(1);
  }

  console.log('[..] Trying to access folder:', process.env.GOOGLE_DRIVE_FOLDER_ID);
  try {
    const folder = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id, name, mimeType',
      supportsAllDrives: true,
    });
    console.log('[OK] Folder found:', folder.data.name, `(${folder.data.mimeType})`);
    if (folder.data.mimeType !== 'application/vnd.google-apps.folder') {
      console.error('[WARN] GOOGLE_DRIVE_FOLDER_ID does not point to a folder.');
    }
  } catch (err) {
    console.error('[FAIL] Could not access folder:', err.response?.data?.error?.message || err.message);
    console.error('       Check that GOOGLE_DRIVE_FOLDER_ID is correct and that the folder is');
    console.error('       shared with the service account\'s client_email as an editor.');
    process.exit(1);
  }

  console.log('[..] Trying a real test upload...');
  try {
    const { Readable } = require('stream');
    const res = await drive.files.create({
      requestBody: {
        name: `_connection_test_${Date.now()}.txt`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: { mimeType: 'text/plain', body: Readable.from(['connection test']) },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });
    console.log('[OK] Test file uploaded:', res.data.webViewLink);
    console.log('     You can delete this test file from Drive now.');
    console.log('\nAll checks passed — the Drive connection works.');
  } catch (err) {
    console.error('[FAIL] Test upload failed:', err.response?.data?.error?.message || err.message);
    process.exit(1);
  }
}

main();
