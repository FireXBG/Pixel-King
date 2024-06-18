const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_126164523200-1kmpmvp42nlk1dsr6gseve5pthp74fee.apps.googleusercontent.com.json');

let oAuth2Client;

async function loadSavedCredentialsIfExist() {
    try {
        const content = fs.readFileSync(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client) {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

async function initializeDrive() {
    oAuth2Client = await authorize();
}

async function uploadFile(filePath, mimeType, parentFolderId) {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const fileMetadata = {
        name: path.basename(filePath),
        parents: [parentFolderId],
    };
    const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
    };
    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });
    console.log(`Uploaded file ID: ${response.data.id}`);
    return response.data.id;
}

async function listFiles() {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const response = await drive.files.list({
        pageSize: 10,
        fields: 'files(id, name)',
    });
    return response.data.files;
}

module.exports = {
    initializeDrive,
    uploadFile,
    listFiles,
};
