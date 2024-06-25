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

exports.getWallpapersByViewAndTags = async (view, tags, page, limit) => {
    try {
        const query = { view };
        if (tags.length > 0) {
            query.tags = { $in: tags };
        }

        const totalCount = await AdminWallpapers.countDocuments(query);

        // Calculate the correct skip value for normal pagination
        const skip = (page - 1) * limit;

        const wallpapers = await AdminWallpapers.find(query)
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .skip(skip)
            .limit(limit);

        const wallpapersWithThumbnails = await Promise.all(wallpapers.map(async (wallpaper) => {
            const thumbnailData = await getFile(wallpaper.thumbnailID); // Fetch only thumbnail content and metadata
            return {
                ...wallpaper.toObject(),
                thumbnailData: thumbnailData.data.toString('base64'), // Base64 encoded thumbnail data
                thumbnailContentType: thumbnailData.mimeType,
            };
        }));

        return { wallpapers: wallpapersWithThumbnails, totalCount };
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

exports.updateWallpaperTags = async (wallpaperId, newTags) => {
    try {
        await AdminWallpapers.findByIdAndUpdate(wallpaperId, { tags: newTags });
        console.log('Tags updated successfully:', wallpaperId);
    } catch (error) {
        console.error('Error updating tags:', error);
        throw new Error('An error occurred while updating the tags');
    }
};

exports.getWallpaperById = async (id) => {
    try {
        const wallpaper = await AdminWallpapers.findById(id);
        if (!wallpaper) {
            throw new Error('Wallpaper not found');
        }
        const thumbnailData = await getFile(wallpaper.thumbnailID);
        return {
            ...wallpaper.toObject(),
            thumbnailData: thumbnailData.data.toString('base64'), // Base64 encoded thumbnail data
            thumbnailContentType: thumbnailData.mimeType,
        };
    } catch (error) {
        console.error('Error fetching wallpaper by ID:', error);
        throw new Error('An error occurred while fetching the wallpaper');
    }
};