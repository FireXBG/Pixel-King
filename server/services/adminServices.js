const AdminUser = require('../models/adminUserSchema.js');
const AdminWallpapers = require('../models/adminWallpapersSchema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadFile, getFile, deleteFile, createAndUploadThumbnail } = require('../config/googleDrive.js');

const DESKTOP_FOLDER_ID = '1mQ0ZRO1pHOV0KoeifLHlzYJcWMXWw-SM';
const MOBILE_FOLDER_ID = '1lgxNXp83lPkk_z0pIxxsSkwDfqXCkKVT';
const THUMBNAIL_FOLDER_ID = '1azk9JqO-pF5O3jAvzlYIlA8dZsRnNyma';

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
};

exports.uploadWallpaper = async (file, tags, view) => {
    try {
        const { path: filePath, mimetype } = file;
        const parentFolderId = view === 'desktop' ? DESKTOP_FOLDER_ID : MOBILE_FOLDER_ID;
        const { id: driveID } = await uploadFile(filePath, mimetype, parentFolderId);

        // Ensure createAndUploadThumbnail returns an object with id
        const thumbnailResponse = await createAndUploadThumbnail(filePath, THUMBNAIL_FOLDER_ID);
        const thumbnailID = thumbnailResponse.id;

        if (!thumbnailID) {
            throw new Error('Thumbnail ID is missing');
        }

        const newWallpaper = { driveID, thumbnailID, tags, view };
        await AdminWallpapers.create(newWallpaper);

        console.log('Wallpaper uploaded successfully:', newWallpaper);
        return newWallpaper;
    } catch (error) {
        console.error('Error uploading wallpaper:', error);
        throw new Error('An error occurred while uploading the wallpaper');
    }
};


exports.getWallpapers = async () => {
    try {
        const wallpapers = await AdminWallpapers.find();
        const wallpapersWithFiles = await Promise.all(wallpapers.map(async (wallpaper) => {
            const fileData = await getFile(wallpaper.driveID);
            const thumbnailData = await getFile(wallpaper.thumbnailID);

            return {
                ...wallpaper.toObject(),
                fileData: fileData.data.toString('base64'),
                contentType: fileData.mimeType,
                thumbnailData: thumbnailData.data.toString('base64'),
                thumbnailContentType: thumbnailData.mimeType,
            };
        }));
        return wallpapersWithFiles;
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        throw new Error('An error occurred while fetching wallpapers');
    }
};

exports.deleteWallpaper = async (wallpaperId) => {
    try {
        const wallpaper = await AdminWallpapers.findById(wallpaperId);
        if (!wallpaper) {
            throw new Error('Wallpaper not found');
        }

        await deleteFile(wallpaper.driveID);
        await deleteFile(wallpaper.thumbnailID);

        await AdminWallpapers.findByIdAndDelete(wallpaperId);

        console.log('Wallpaper deleted successfully:', wallpaperId);
    } catch (error) {
        console.error('Error deleting wallpaper:', error);
        throw new Error('An error occurred while deleting the wallpaper');
    }
};
