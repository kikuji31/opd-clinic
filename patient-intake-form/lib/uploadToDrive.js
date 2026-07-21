const { google } = require('googleapis');
const { Readable } = require('stream');

function getDriveClient() {
  // Service account instead of a user OAuth refresh token: refresh tokens
  // issued while the OAuth consent screen is in "Testing" mode expire every
  // 7 days, which silently broke uploads. A service account key doesn't
  // expire, at the cost of needing the target folder shared with its email.
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

async function uploadPdf(buffer, filename) {
  const drive = getDriveClient();
  // Readable.from(buffer) would iterate the Buffer byte-by-byte (Buffer is
  // iterable) instead of streaming it as one chunk — wrap in an array so
  // it's treated as a single-item iterable containing the whole buffer.
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] },
    media: { mimeType: 'application/pdf', body: Readable.from([buffer]) },
    fields: 'id, webViewLink',
    // Needed if GOOGLE_DRIVE_FOLDER_ID points into a Shared Drive — without
    // this, the API can't see the folder and upload fails silently.
    supportsAllDrives: true,
  });
  return res.data;
}

module.exports = { uploadPdf };
