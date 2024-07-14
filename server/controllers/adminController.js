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
    console.log(`Assembling file: ${fileId} from ${totalChunks} chunks`);
    const chunkFiles = fs.readdirSync(tempDir).filter(file => file.startsWith(fileId)).sort((a, b) => {
        const aIndex = parseInt(a.split('-').pop(), 10);
        const bIndex = parseInt(b.split('-').pop(), 10);
        return aIndex - bIndex;
    });

    console.log(`Found ${chunkFiles.length} chunks for file: ${fileId}`);

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
    const limit = parseInt(req.query.limit) || 20;
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
    try {
        const fileContent = await getFile(driveId);
        if (!fileContent) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.set('Content-Type', fileContent.mimeType);
        res.send(fileContent.data);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

router.post('/upload', upload.single('chunk'), async (req, res) => {
    const { fileId, chunkIndex, totalChunks, metadata, fileIndex } = req.body;

    try {
        console.log(`Received chunk ${chunkIndex} of ${totalChunks} for file: ${fileId}`);

        const currentChunkPath = path.join(tempDir, `${fileId}-chunk-${chunkIndex}`);
        if (!fs.existsSync(currentChunkPath)) {
            throw new Error(`Chunk not found: ${currentChunkPath}`);
        }

        const chunkFiles = fs.readdirSync(tempDir).filter(file => file.startsWith(fileId));
        if (chunkFiles.length === parseInt(totalChunks)) {
            const assembledFilePath = await assembleFile(fileId, parseInt(totalChunks));

            const fileMetadata = JSON.parse(metadata);

            // Upload the assembled file
            const uploadResults = [];
            const io = getIO();

            try {
                const tags = fileMetadata.tags ? fileMetadata.tags : [];
                const view = fileMetadata.view || 'desktop';
                const isPaid = fileMetadata.isPaid;

                const resolutionResults = await adminServices.uploadWallpaper({
                    path: assembledFilePath,
                    mimetype: 'image/jpeg', // or the appropriate mime type
                }, tags, view, isPaid);
                uploadResults.push(resolutionResults);

                io.emit('uploadComplete', { fileIndex });
                res.status(200).json({ message: 'Files uploaded successfully', uploadResults });

                // Clean up temporary files
                fs.unlinkSync(assembledFilePath);
            } catch (uploadError) {
                console.error('Error uploading file:', uploadError);
                res.status(500).json({ error: 'An error occurred while uploading the file' });
            }

        } else {
            const io = getIO();
            io.emit('uploadProgress', {
                fileIndex,
                progress: ((parseInt(chunkIndex) + 1) / parseInt(totalChunks)) * 100
            });

            res.status(200).json({ message: 'Chunk uploaded successfully' });
        }

    } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).json({ error: 'An error occurred while uploading the file' });
    }
});

router.put('/wallpapers/:id', isAuthorized, async (req, res) => {
    const wallpaperId = req.params.id;
    const newTags = req.body.tags;
    const isPaid = req.body.isPaid;

    try {
        await adminServices.updateWallpaperTagsAndIsPaid(wallpaperId, newTags, isPaid); // Update service function to handle isPaid
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
    const { wallpaperId, resolution, aspectRatio } = req.body;
    try {
        const wallpaper = await adminServices.getWallpaperById(wallpaperId);
        if (!wallpaper) {
            console.log('Wallpaper not found');
            return res.status(404).json({ error: 'Wallpaper not found' });
        }

        const fileContent = await getFile(wallpaper.driveID);
        if (!fileContent) {
            console.log('File content not found');
            return res.status(404).json({ error: 'File content not found' });
        }

        // Parse the resolution
        const [width, height] = resolution.split('x').map(Number);

        // Resize the image to the specified resolution
        const image = await Jimp.read(fileContent.data);
        image.resize(width, height);

        const resizedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

        res.status(200).json({
            base64Image: resizedImageBuffer.toString('base64'),
            mimeType: fileContent.mimeType,
        });
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
