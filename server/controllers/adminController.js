const router = require('express').Router();
const adminServices = require('../services/adminServices');
const { getFile } = require('../config/googleDrive');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getIO } = require('../config/socket'); // Correctly import io instance

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

router.post('/login', async (req, res) => {
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
    console.log(`Fetching wallpapers for view: ${view}`);
    try {
        const wallpapers = await adminServices.getWallpapersByView(view);
        console.log(`Fetched ${view} wallpapers:`, wallpapers.length);
        res.status(200).json(wallpapers);
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        res.status(500).json({ error: 'An error occurred while fetching wallpapers.' });
    }
});

router.get('/wallpapers/:id', async (req, res) => {
    const fileId = req.params.id;
    try {
        const fileContent = await getFile(fileId);
        if (!fileContent) {
            return res.status(404).json({ error: 'Wallpaper not found' });
        }
        res.set('Content-Type', fileContent.contentType);
        console.log('Fetched wallpaper:', fileId);
        res.send(fileContent.data);
    } catch (error) {
        console.error('Error fetching wallpaper:', error);
        res.status(500).json({ error: 'An error occurred while fetching the wallpaper' });
    }
});

router.post('/upload', upload.array('wallpapers'), async (req, res) => {
    const files = req.files;
    const data = req.body;
    const uploadResults = [];
    const totalFiles = files.length; // Correct total files calculation
    const io = getIO(); // Get the io instance

    try {
        await Promise.all(files.map(async (file, index) => {
            const tags = data[`tags_${index}`] ? data[`tags_${index}`].split(' ').filter(tag => tag.trim() !== '') : [];
            const view = data[`view_${index}`] || 'desktop';
            console.log(`Uploading file with view: ${view}`); // Log the view to check

            const uploadResult = await adminServices.uploadWallpaper(file, tags, view);
            uploadResults.push(uploadResult);

            fs.unlinkSync(file.path);
            console.log(`Deleted temp file: ${file.path}`);

            // Send progress update
            io.emit('uploadProgress', {
                progress: ((uploadResults.length) / totalFiles) * 100
            });
        }));

        // Emit complete event after all files are uploaded
        io.emit('uploadComplete');

        res.status(200).json({ message: 'Files uploaded successfully', uploadResults });
    } catch (error) {
        console.error('Error uploading files:', error);

        files.forEach(file => {
            try {
                fs.unlinkSync(file.path);
                console.log(`Deleted temp file: ${file.path}`);
            } catch (err) {
                console.error(`Error deleting temp file: ${file.path}`, err);
            }
        });

        res.status(500).json({ error: 'An error occurred while uploading files. Please try again later.' });
    }
});


router.delete('/wallpapers/:id', async (req, res) => {
    const wallpaperId = req.params.id;
    try {
        await adminServices.deleteWallpaper(wallpaperId);
        res.status(200).json({ message: 'Wallpaper deleted successfully' });
    } catch (error) {
        console.error('Error deleting wallpaper:', error);
        res.status(500).json({ error: 'An error occurred while deleting the wallpaper.' });
    }
});

module.exports = router;
