const router = require('express').Router();
const adminServices = require('../services/adminServices');
const { getFile } = require('../config/googleDrive');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir); // Save to 'temp' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
    }
});
const upload = multer({ storage: storage });

// Route to handle admin login
router.post('/login', async (req, res) => {
    const data = req.body;

    try {
        const token = await adminServices.login(data.username, data.password);
        console.log('Admin logged in:', data.username);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);

        if (error.message === 'Invalid credentials') {
            res.status(401).json({
                error: 'Invalid username or password.'
            });
        } else {
            res.status(500).json({
                error: 'An error occurred. Please try again later.'
            });
        }
    }
});

// Route to get all wallpapers
router.get('/wallpapers', async (req, res) => {
    try {
        const wallpapers = await adminServices.getWallpapers();
        res.status(200).json(wallpapers);
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        res.status(500).json({ error: 'An error occurred while fetching wallpapers.' });
    }
});

// Route to serve a wallpaper image by ID
router.get('/wallpapers/:id', async (req, res) => {
    const fileId = req.params.id;

    try {
        const fileData = await getFile(fileId);
        if (fileData.thumbnailLink) {
            res.redirect(fileData.thumbnailLink);
        } else {
            res.status(404).json({ error: 'Thumbnail not available' });
        }
    } catch (error) {
        console.error('Error fetching wallpaper image:', error);
        res.status(500).json({ error: 'An error occurred while fetching the wallpaper image.' });
    }
});

// Route to upload wallpapers
router.post('/upload', upload.array('wallpapers'), async (req, res) => {
    const files = req.files;
    const data = req.body;

    try {
        const uploadResults = await adminServices.uploadWallpaper(files, data);

        // Clean up temporary files after upload
        files.forEach(file => {
            fs.unlinkSync(file.path); // Delete each file synchronously
        });

        res.status(200).json({ message: 'Files uploaded successfully', uploadResults });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            error: 'An error occurred while uploading files. Please try again later.'
        });
    }
});

// Route to delete a wallpaper
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