const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');

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

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error.message);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        throw new Error('Error uploading file to Google Drive');
    }
}

async function createAndUploadThumbnail(filePath, parentFolderId) {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const thumbnailPath = path.join(__dirname, `thumbnail-${uuidv4()}.jpg`);

    const image = await Jimp.read(filePath);
    await image.resize(1000, Jimp.AUTO).writeAsync(thumbnailPath);

    const fileMetadata = {
        name: 'thumbnail_' + path.basename(filePath),
        parents: [parentFolderId],
    };
    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(thumbnailPath),
    };

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webContentLink',
        });

        // Make the thumbnail publicly accessible
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        console.log(`Uploaded thumbnail ID: ${response.data.id}`);
        fs.unlinkSync(thumbnailPath); // Delete the local thumbnail file
        return response.data; // Ensure it returns { id, webContentLink }
    } catch (error) {
        console.error('Error uploading thumbnail to Google Drive:', error.message);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        throw new Error('Error uploading thumbnail to Google Drive');
    }
}

async function getFile(fileId) {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, thumbnailLink',
    });

    const contentResponse = await drive.files.get({
        fileId,
        alt: 'media',
    }, {
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const chunks = [];
        contentResponse.data
            .on('data', (chunk) => {
                chunks.push(chunk);
            })
            .on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({
                    id: response.data.id,
                    name: response.data.name,
                    mimeType: response.data.mimeType,
                    thumbnailLink: response.data.thumbnailLink,
                    data: buffer,
                });
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function deleteFile(fileId) {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    try {
        await drive.files.delete({ fileId });
        console.log(`Deleted file ID: ${fileId}`);
    } catch (error) {
        if (error.code === 404) {
            console.warn(`File not found: ${fileId}`);
        } else {
            console.error(`Error deleting file ID: ${fileId}`, error);
            throw new Error(`Error deleting file ID: ${fileId}`);
        }
    }
}

async function resizeImage(imageBuffer, width, height) {
    try {
        const image = await Jimp.read(imageBuffer);
        image.resize(width, height);

        const resizedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        return resizedImageBuffer;
    } catch (error) {
        console.error('Error resizing image using Jimp:', error);
        throw new Error('Error resizing image using Jimp');
    }
}

module.exports = {
    initializeDrive,
    uploadFile,
    createAndUploadThumbnail,
    getFile,
    deleteFile,
    resizeImage
};