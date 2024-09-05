const express = require('express');
const router = express.Router();
const adminServices = require('../services/adminServices');
const userServices = require('../services/usersServices');
const { getFile } = require('../config/googleDrive');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { getIO } = require('../config/socket');
const { v4: uuidv4 } = require('uuid');
const tempDir = path.join(__dirname, 'temp');
const jwt = require('jsonwebtoken');
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
let isUploadInProgress = false;

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

        fs.unlinkSync(chunkPath);
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
        const {token, role} = await adminServices.login(data.username, data.password);
        console.log('Admin logged in:', data.username);
        res.status(200).json({ token, role });
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
    const limit = parseInt(req.query.limit) || 9; // Set to 9 per page

    console.log(`Fetching wallpapers for view: ${view}, page: ${page}, limit: ${limit}, tags: ${tags}`);

    try {
        const { wallpapers, totalCount } = await adminServices.getWallpapersByViewAndTags(view, tags, page, limit);
        console.log(`Fetched ${view} wallpapers:`, wallpapers.length);

        res.status(200).json({ wallpapers, totalCount });
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        res.status(500).json({ error: 'An error occurred while fetching wallpapers.' });
    }
});

router.get('/wallpapers/:driveId', async (req, res) => {
    const { driveId } = req.params;
    const { preview } = req.query; // Expecting a query parameter to indicate if it's a preview

    if (!driveId) {
        return res.status(400).json({ error: 'Drive ID is required' });
    }

    try {
        const fileContent = await adminServices.getWallpaperById(driveId, preview === 'true');

        if (!fileContent) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.set('Content-Type', 'image/jpeg');
        res.send(fileContent);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

router.post('/upload', upload.single('chunk'), async (req, res) => {
    const { fileId, chunkIndex, totalChunks } = req.body;

    try {
        console.log(`Uploading chunk ${chunkIndex} of ${totalChunks} for file ${fileId}`);
        if (!receivedChunks[fileId]) {
            receivedChunks[fileId] = new Array(parseInt(totalChunks)).fill(false);
        }

        receivedChunks[fileId][chunkIndex] = true;

        const allChunksReceived = receivedChunks[fileId].every(chunk => chunk);

        res.status(200).json({ message: 'Chunk uploaded successfully', allChunksReceived });
    } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).json({ error: 'An error occurred while uploading the file' });
    }
});

router.post('/uploadComplete', async (req, res) => {
    if (isUploadInProgress) {
        return res.status(400).json({ error: 'Another upload is already in progress. Please wait.' });
    }

    const { files } = req.body;
    isUploadInProgress = true;
    let processedFiles = 0;
    const totalFiles = files.length;

    const io = getIO(); // Initialize socket.io

    res.status(200).json({ message: 'Files uploaded successfully. Processing in progress.' });

    await (async () => {
        try {
            for (const file of files) {
                const { fileId, totalChunks, metadata } = file;

                // Wait until all chunks are received before calling assembleFile
                while (!receivedChunks[fileId].every(chunk => chunk)) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                const assembledFilePath = await assembleFile(fileId, parseInt(totalChunks));

                const fileMetadata = JSON.parse(metadata);
                fileMetadata.filePath = assembledFilePath;
                fileMetadata.fileId = fileId;

                await adminServices.uploadWallpaper({
                    path: assembledFilePath,
                    mimetype: 'image/jpeg'
                }, fileMetadata.tags, fileMetadata.view, fileMetadata.isPaid);

                fs.unlinkSync(assembledFilePath);

                processedFiles++;
                const progressPercentage = (processedFiles / totalFiles) * 100;
                console.log(`Processed file ${processedFiles} of ${totalFiles} (${progressPercentage.toFixed(2)}%)`); // Log progress
                io.emit('uploadProgress', { percentage: progressPercentage }); // Emit progress
            }

            // Send upload completion email after all files are processed
            await adminServices.sendUploadEmail();
        } catch (error) {
            console.error('Error handling upload completion:', error);
        } finally {
            isUploadInProgress = false; // Release the lock
        }
    })();
});

router.get('/checkUploadStatus', (req, res) => {
    res.status(200).json({ isUploadInProgress });
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
        res.status(500).json({ error: 'An error occurred while deleting the wallpaper' });
    }
});

router.post('/download', async (req, res) => {
    const { wallpaperId, resolution } = req.body;
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!wallpaperId || !resolution) {
        return res.status(400).json({ error: 'Wallpaper ID and resolution are required' });
    }

    try {
        const userId = await adminServices.verifyToken(token).id;
        const wallpaper = await adminServices.getWallpaperDataById(wallpaperId);
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
                const isFree = await userServices.hasFreeDownloads(userId, resolution);
                if(!isFree) {
                    await userServices.chargePixels(userId, 5);
                    break;
                }
                await userServices.useFreeDownload(userId, resolution);
                break;
            case '8K':
                driveId = wallpaper.driveID_8K;
                const isFree8K = await userServices.hasFreeDownloads(userId, resolution);
                if(!isFree8K) {
                    await userServices.chargePixels(userId, 10);
                    break;
                }
                await userServices.useFreeDownload(userId, resolution);
                break;
            default:
                return res.status(400).json({ error: 'Invalid resolution' });
        }

        if (!driveId) {
            console.log('Drive ID not found for the requested resolution');
            return res.status(404).json({ error: 'Drive ID not found for the requested resolution' });
        }

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

router.get('/users', isAuthorized , async (req, res) => {
    try {
        const users = await adminServices.getAllUsers();
        console.log('Fetched users:', users);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
});

router.post('/authorizeUser', isAuthorized, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;

    try {
        await adminServices.authorizeUser(username, password, role);
        console.log('User authorized:', username);
        res.status(200).json({ message: 'User authorized successfully' });
    } catch (error) {
        console.error('Error authorizing user:', error);
        res.status(500).json({ error: 'An error occurred while authorizing user.' });
    }
});

router.put('/users/:username/role', isAuthorized, async (req, res) => {
    const { username } = req.params;
    const { role } = req.body;

    try {
        await adminServices.updateUserRole(username, role);
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'An error occurred while updating the user role' });
    }
});

router.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const { password, role } = req.body;

    try {
        await adminServices.updateUser(username, password, role);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'An error occurred while updating the user' });
    }
});

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
        res.status(500).json({ error: 'An error occurred while adding the email' });
    }
});

router.get('/emails', isAuthorized, async (req, res) => {
    try {
        const emails = await adminServices.getEmails();
        console.log('Fetched emails:', emails.length);
        res.status(200).json({ emails });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'An error occurred while fetching emails' });
    }
});

router.delete('/emails/:email', isAuthorized, async (req, res) => {
    try {
        const { email } = req.params;
        console.log(`Deleting email: ${email}`); // Debugging log
        await adminServices.deleteEmail(email);
        res.status(200).json({ message: 'Email deleted successfully' });
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({ error: 'An error occurred while deleting the email' });
    }
});

router.get('/getStorageQuota', isAuthorized, async (req, res) => {
    try {
        const storageQuota = await adminServices.getStorageQuota();
        res.status(200).json({ storageQuota });
    } catch (error) {
        console.error('Error fetching storage quota:', error);
        res.status(500).json({ error: 'An error occurred while fetching storage quota.' });
    }
})

router.post('/contact', upload.none(), async (req, res) => {
    const data = req.body;
    try {
        await adminServices.sendContactEmail(data);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while sending the email.' });
    }
});

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
