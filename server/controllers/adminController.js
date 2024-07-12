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
const unzipper = require('unzipper');

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
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

router.post('/upload', upload.single('compressedFiles'), async (req, res) => {
    const file = req.file;
    const data = req.body;
    const uploadResults = [];
    const io = getIO();

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const tempDirForExtraction = path.join(tempDir, uuidv4());
    fs.mkdirSync(tempDirForExtraction, { recursive: true });

    try {
        await fs.createReadStream(file.path)
            .pipe(unzipper.Extract({ path: tempDirForExtraction }))
            .promise();

        const extractedFiles = fs.readdirSync(tempDirForExtraction);

        await Promise.all(extractedFiles.map(async (extractedFile, index) => {
            const filePath = path.join(tempDirForExtraction, extractedFile);
            const tags = data[`tags_${index}`] ? data[`tags_${index}`].split(' ').filter(tag => tag.trim() !== '') : [];
            const view = data[`view_${index}`] || 'desktop';
            const isPaid = data[`isPaid_${index}`] === 'true';

            try {
                const resolutionResults = await adminServices.uploadWallpaper({
                    path: filePath,
                    mimetype: 'image/jpeg', // or the appropriate mime type
                }, tags, view, isPaid);
                uploadResults.push(resolutionResults);
            } catch (uploadError) {
                console.error(`Error uploading file ${filePath}:`, uploadError);
            } finally {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted temp file: ${filePath}`);
                } catch (unlinkError) {
                    console.error(`Error deleting temp file: ${filePath}`, unlinkError);
                }
            }

            io.emit('uploadProgress', {
                progress: ((uploadResults.length) / extractedFiles.length) * 100
            });
        }));

        io.emit('uploadComplete');

        res.status(200).json({ message: 'Files uploaded successfully', uploadResults });
    } catch (error) {
        console.error('Error extracting files:', error);

        extractedFiles.forEach(file => {
            const filePath = path.join(tempDirForExtraction, file);
            try {
                fs.unlinkSync(filePath);
                console.log(`Deleted temp file: ${filePath}`);
            } catch (err) {
                console.error(`Error deleting temp file: ${filePath}`, err);
            }
        });

        res.status(500).json({ error: 'An error occurred while uploading files. Please try again later.' });
    } finally {
        try {
            fs.unlinkSync(file.path); // Delete the uploaded zip file
            fs.rmdirSync(tempDirForExtraction, { recursive: true }); // Clean up the extraction directory
        } catch (error) {
            console.error('Error cleaning up:', error);
        }
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
