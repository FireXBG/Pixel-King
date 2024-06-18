const router = require('express').Router();
const bcrypt = require('bcryptjs');
const adminServices = require('../services/adminServices');
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

// Handle file uploads using multer
router.post('/upload', upload.array('wallpapers'), async (req, res) => {
    const files = req.files; // Access the array of files directly
    const data = req.body;

    try {
        const uploadResults = await adminServices.uploadWallpaper(files, data);
        res.status(200).json({ message: 'Files uploaded successfully', uploadResults });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            error: 'An error occurred while uploading files. Please try again later.'
        });
    }
});

module.exports = router;
