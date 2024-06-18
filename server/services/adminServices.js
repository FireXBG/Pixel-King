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
        // Parse data to extract tags and view for each file
        const fileData = Object.keys(data).reduce((acc, key) => {
            const [field, index] = key.split('_');
            if (!acc[index]) {
                acc[index] = {};
            }
            if (field === 'tags') {
                if (!acc[index][field]) {
                    acc[index][field] = [];
                }
                // Split tags string by spaces (or any other delimiter) and push them individually
                const individualTags = data[key].split(' ').filter(tag => tag.trim() !== '');
                acc[index][field].push(...individualTags);
            } else {
                acc[index][field] = data[key];
            }
            return acc;
        }, []);

        // Upload files and save records to database
        const uploadedFiles = await Promise.all(files.map(async (file, index) => {
            const { path: filePath, mimetype } = file;
            const { tags, view } = fileData[index];

            const parentFolderId = view === 'desktop' ? DESKTOP_FOLDER_ID : MOBILE_FOLDER_ID;

            const { id: driveID } = await uploadFile(filePath, mimetype, parentFolderId);

            return { driveID, tags, view };
        }));

        // Save the wallpaper records to the database
        await AdminWallpapers.create(uploadedFiles);

        console.log('Wallpapers uploaded successfully:', uploadedFiles);
    } catch (error) {
        console.error('Error uploading wallpaper:', error);
        throw new Error('An error occurred while uploading the wallpaper');
    }
}

exports.getWallpapers = async () => {
    try {
        const wallpapers = await AdminWallpapers.find();
        const wallpapersWithFiles = await Promise.all(wallpapers.map(async (wallpaper) => {
            const fileData = await getFileAsBase64(wallpaper.driveID); // Fetch file content as base64
            return {
                ...wallpaper.toObject(),
                fileData,
            };
        }));
        return wallpapersWithFiles;
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        throw new Error('An error occurred while fetching wallpapers');
    }
}

// Function to fetch file content from Google Drive as base64
async function getFileAsBase64(fileId) {
    const file = await getFile(fileId);
    if (!file) {
        throw new Error(`File not found: ${fileId}`);
    }
    const buffer = Buffer.from(file.data, 'base64');
    return buffer.toString('base64');
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