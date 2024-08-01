const express = require('express');
const router = express.Router();
const adminServices = require('../services/adminServices');
const { getFile } = require('../config/googleDrive');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const rateLimit = require('express-rate-limit');
const { getIO } = require('../config/socket');
const { v4: uuidv4 } = require('uuid');
const zlib = require('zlib');

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${req.body.fileId}-chunk-${req.body.chunkIndex}`);
    }
});
const upload = multer({ storage: storage });

const receivedChunks = {};

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'Too many requests from this IP, please try again after a minute',
        });
    },
});

const assembleFile = async (fileId, totalChunks) => {
    const chunkFiles = fs.readdirSync(tempDir).filter(file => file.startsWith(fileId)).sort((a, b) => {
        const aIndex = parseInt(a.split('-').pop(), 10);
        const bIndex = parseInt(b.split('-').pop(), 10);
        return aIndex - bIndex;
    });

    if (chunkFiles.length !== totalChunks) {
        throw new Error(`Expected ${totalChunks} chunks, but found ${chunkFiles.length}`);
    }

    const assembledFilePath = path.join(tempDir, fileId);
    const writeStream = fs.createWriteStream(assembledFilePath);

    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(tempDir, `${fileId}-chunk-${i}`);
        if (!fs.existsSync(chunkPath)) {
            throw new Error(`Chunk not found: ${chunkPath}`);
        }
        const readStream = fs.createReadStream(chunkPath);

        await new Promise((resolve, reject) => {
            readStream.pipe(writeStream, { end: false });
            readStream.on('end', resolve);
            readStream.on('error', reject);
        });

        fs.unlinkSync(chunkPath); // Remove chunk file after it's been read
    }

    writeStream.end();
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(assembledFilePath));
        writeStream.on('error', reject);
    });
};

router.post('/login', limiter, async (req, res) => {
    const data = req.body;
    try {
        const token = await adminServices.login(data.username, data.password);
        console.log('Admin logged in:', data.username);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        if (error.message === 'Invalid credentials') {
            res.status(401).json({ error: 'Invalid username or password.' });
        } else {
            res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }
    }
});

router.get('/wallpapers', async (req, res) => {
    const view = req.query.view || 'desktop'; // Default to 'desktop' if not specified
    const tags = req.query.tags ? req.query.tags.split(' ') : []; // Get tags from query, split by space
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8; // Set to 8 per page
    const id = req.query.id;

    console.log(`Fetching wallpapers for view: ${view}, page: ${page}, limit: ${limit}, tags: ${tags}`);

    try {
        if (id) {
            const wallpaper = await adminServices.getWallpaperById(id);
            if (!wallpaper) {
                return res.status(404).json({ error: 'Wallpaper not found' });
            }
            return res.status(200).json({ wallpapers: [wallpaper], totalCount: 1 });
        }

        const { compressedBuffer, contentType, encoding } = await adminServices.getWallpapersByViewAndTags(view, tags, page, limit);
        console.log(`Fetched ${view} wallpapers:`, compressedBuffer.length);

        res.set('Content-Encoding', encoding);
        res.set('Content-Type', contentType);
        res.send(compressedBuffer);
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        res.status(500).json({ error: 'An error occurred while fetching wallpapers.' });
    }
});

router.get('/wallpapers/:driveId', async (req, res) => {
    const { driveId } = req.params;
    if (!driveId) {
        return res.status(400).json({ error: 'Drive ID is required' });
    }
    try {
        console.log('Fetching file with Drive ID:', driveId);
        const fileContent = await getFile(driveId);
        if (!fileContent) {
            return res.status(404).json({ error: 'File not found' });
        }

        const base64Image = fileContent.toString('base64');
        zlib.gzip(Buffer.from(base64Image, 'utf-8'), (err, compressedBuffer) => {
            if (err) {
                console.error('Error compressing file:', err);
                return res.status(500).json({ error: 'Failed to compress file' });
            }
            const compressedBase64 = compressedBuffer.toString('base64');
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'application/octet-stream');
            res.send(compressedBase64);
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

router.post('/upload', upload.single('chunk'), async (req, res) => {
    const { fileId, chunkIndex, totalChunks, metadata, fileIndex } = req.body;

    try {
        if (!receivedChunks[fileId]) {
            receivedChunks[fileId] = new Array(parseInt(totalChunks)).fill(false);
        }

        receivedChunks[fileId][chunkIndex] = true;

        const allChunksReceived = receivedChunks[fileId].every(chunk => chunk);

        if (allChunksReceived) {
            res.status(200).json({ message: 'Chunk uploaded successfully', allChunksReceived: true });
        } else {
            res.status(200).json({ message: 'Chunk uploaded successfully', allChunksReceived: false });
        }
    } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).json({ error: 'An error occurred while uploading the file' });
    }
});

router.post('/uploadComplete', async (req, res) => {
    const { files } = req.body;

    try {
        const fileUploadPromises = files.map(async file => {
            const { fileId, totalChunks, metadata } = file;
            const assembledFilePath = await assembleFile(fileId, parseInt(totalChunks));

            const fileMetadata = JSON.parse(metadata);
            fileMetadata.filePath = assembledFilePath;
            fileMetadata.fileId = fileId;

            await adminServices.uploadWallpaper({ path: assembledFilePath, mimetype: 'image/jpeg' }, fileMetadata.tags, fileMetadata.view, fileMetadata.isPaid);
            fs.unlinkSync(assembledFilePath);
        });

        await Promise.all(fileUploadPromises);

        // Send upload completion email
        await adminServices.sendUploadEmail();

        res.status(200).json({ message: 'All files uploaded successfully and email sent.' });
    } catch (error) {
        console.error('Error handling upload completion:', error);
        res.status(500).json({ error: 'An error occurred while completing the upload' });
    }
});

router.put('/wallpapers/:id', isAuthorized, async (req, res) => {
    const wallpaperId = req.params.id;
    const newTags = req.body.tags;
    const isPaid = req.body.isPaid;

    try {
        await adminServices.updateWallpaperTagsAndIsPaid(wallpaperId, newTags, isPaid);
        res.status(200).json({ message: 'Tags and isPaid status updated successfully' });
    } catch (error) {
        console.error('Error updating tags and isPaid status:', error);
        res.status(500).json({ error: 'An error occurred while updating the tags and isPaid status.' });
    }
});

router.delete('/wallpapers/:id', isAuthorized, async (req, res) => {
    const wallpaperId = req.params.id;
    try {
        await adminServices.deleteWallpaper(wallpaperId);
        res.status(200).json({ message: 'Wallpaper deleted successfully' });
    } catch (error) {
        console.error('Error deleting wallpaper:', error);
        res.status(500).json({ error: 'An error occurred while deleting the wallpaper.' });
    }
});

router.post('/download', async (req, res) => {
    const { wallpaperId, resolution } = req.body;
    if (!wallpaperId || !resolution) {
        return res.status(400).json({ error: 'Wallpaper ID and resolution are required' });
    }

    try {
        const wallpaper = await adminServices.getWallpaperById(wallpaperId);
        if (!wallpaper) {
            console.log('Wallpaper not found');
            return res.status(404).json({ error: 'Wallpaper not found' });
        }

        let driveId;
        switch (resolution) {
            case 'HD':
                driveId = wallpaper.driveID_HD;
                break;
            case '4K':
                driveId = wallpaper.driveID_4K;
                break;
            case '8K':
                driveId = wallpaper.driveID_8K;
                break;
            default:
                return res.status(400).json({ error: 'Invalid resolution' });
        }

        if (!driveId) {
            console.log('Drive ID not found for the requested resolution');
            return res.status(404).json({ error: 'Drive ID not found for the requested resolution' });
        }

        console.log('Fetching file with ID:', driveId);
        const fileContent = await getFile(driveId);
        if (!fileContent) {
            console.log('File content not found');
            return res.status(404).json({ error: 'File content not found' });
        }

        res.set('Content-Type', 'image/jpeg');
        res.send(fileContent);
    } catch (error) {
        console.error('Error downloading wallpaper:', error);
        res.status(500).json({ error: 'Failed to download wallpaper' });
    }
});

router.post('/contact', async (req, res) => {
    const data = req.body;
    try {
        await adminServices.sendContactEmail(data);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'An error occurred while sending the email.' });
    }
})

router.get('/users', isAuthorized , async (req, res) => {
    try {
        const users = await adminServices.getAllUsers();
        console.log('Fetched users:', users.length);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
})

router.post('/authorizeUser', isAuthorized, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        await adminServices.authorizeUser(username, password);
        console.log('User authorized:', username);
        res.status(200).json({ message: 'User authorized successfully' });
    } catch (error) {
        console.error('Error authorizing user:', error);
        res.status(500).json({ error: 'An error occurred while authorizing user.' });
    }
})

router.delete('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        await adminServices.deleteUser(username);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'An error occurred while deleting the user.' });
    }
});

router.post('/emails', isAuthorized, async (req, res) => {
    const email = req.body.email;
    try {
        await adminServices.addEmail(email);
        res.status(200).json({ message: 'Email added successfully' });
    } catch (error) {
        console.error('Error adding email:', error);
        res.status(500).json({ error: 'An error occurred while adding the email.' });
    }
});

router.get('/emails', isAuthorized, async (req, res) => {
    try {
        const emails = await adminServices.getEmails();
        console.log('Fetched emails:', emails.length);
        res.status(200).json({ emails });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'An error occurred while fetching emails.' });
    }
})

function isAuthorized(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = adminServices.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = router;
