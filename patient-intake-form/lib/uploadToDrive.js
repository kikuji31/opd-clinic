const { google } = require('googleapis');
const { Readable } = require('stream');

function getDriveClient() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });
  return google.drive({ version: 'v3', auth: oAuth2Client });
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
  });
  return res.data;
}

module.exports = { uploadPdf };
