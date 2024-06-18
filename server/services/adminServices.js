const AdminUser = require('../models/adminUserSchema.js');
const AdminWallpapers = require('../models/adminWallpapersSchema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadFile, getFile, deleteFile } = require('../config/googleDrive.js');
const fs = require('fs');
const path = require('path');

const DESKTOP_FOLDER_ID = '1mQ0ZRO1pHOV0KoeifLHlzYJcWMXWw-SM';
const MOBILE_FOLDER_ID = '1lgxNXp83lPkk_z0pIxxsSkwDfqXCkKVT';

exports.login = async (username, password) => {
    const user = await AdminUser.findOne({ username });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new Error('Invalid credentials');
    }

    return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

exports.uploadWallpaper = async (files, data) => {
    try {
        console.log('Uploading files:', files);
        console.log('Metadata:', data);

        const uploadResults = [];
        for (const [index, file] of files.entries()) {
            const tags = data[`tags_${index}`];
            const view = data[`view_${index}`];

            // Log file and metadata
            console.log(`File: ${file.originalname}`);
            console.log(`Tags: ${tags}`);
            console.log(`View: ${view}`);

            // Determine the parent folder ID based on the view
            const parentFolderId = view === 'desktop' ? DESKTOP_FOLDER_ID : MOBILE_FOLDER_ID;

            // Use the actual file path from multer
            const tempFilePath = file.path;

            // Upload the file to Google Drive
            const fileId = await uploadFile(tempFilePath, file.mimetype, parentFolderId);
            uploadResults.push({ file: file.originalname, fileId });

            // Remove the temporary file
            fs.unlinkSync(tempFilePath);

            // Save the file metadata to the database with the file ID
            const newWallpaper = new AdminWallpapers({
                driveID: fileId,
                tags: tags.split(' '), // Assuming tags are space-separated
                view,
                name: file.originalname
            });

            await newWallpaper.save();

            console.log('File uploaded successfully:', file.originalname);
        }

        return uploadResults;
    } catch (error) {
        console.error('Error uploading files:', error);
        throw new Error('An error occurred while uploading files');
    }
}

exports.getWallpapers = async () => {
    try {
        const wallpapers = await AdminWallpapers.find();
        return wallpapers;
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        throw new Error('An error occurred while fetching wallpapers');
    }
}

exports.deleteWallpaper = async (wallpaperId) => {
    try {
        const wallpaper = await AdminWallpapers.findById(wallpaperId);
        if (!wallpaper) {
            throw new Error('Wallpaper not found');
        }

        // Delete the file from Google Drive
        await deleteFile(wallpaper.driveID);

        // Delete the wallpaper record from the database
        await AdminWallpapers.findByIdAndDelete(wallpaperId);

        console.log('Wallpaper deleted successfully:', wallpaperId);
    } catch (error) {
        console.error('Error deleting wallpaper:', error);
        throw new Error('An error occurred while deleting the wallpaper');
    }
}