const AdminUser = require('../models/adminUserSchema.js');
const AdminWallpapers = require('../models/adminWallpapersSchema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadFile, getFile, deleteFile, createAndUploadThumbnail } = require('../config/googleDrive.js');

const DESKTOP_FOLDER_ID = '1mQ0ZRO1pHOV0KoeifLHlzYJcWMXWw-SM';
const MOBILE_FOLDER_ID = '1lgxNXp83lPkk_z0pIxxsSkwDfqXCkKVT';
const THUMBNAIL_FOLDER_ID = '1azk9JqO-pF5O3jAvzlYIlA8dZsRnNyma'; // Your provided thumbnail folder ID

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

exports.uploadWallpaper = async (files, data) => {
    try {
        const fileData = Object.keys(data).reduce((acc, key) => {
            const [field, index] = key.split('_');
            if (!acc[index]) {
                acc[index] = {};
            }
            if (field === 'tags') {
                if (!acc[index][field]) {
                    acc[index][field] = [];
                }
                const individualTags = data[key].split(' ').filter(tag => tag.trim() !== '');
                acc[index][field].push(...individualTags);
            } else {
                acc[index][field] = data[key];
            }
            return acc;
        }, []);

        const uploadedFiles = await Promise.all(files.map(async (file, index) => {
            const { path: filePath, mimetype } = file;
            const { tags, view } = fileData[index];

            const parentFolderId = view === 'desktop' ? DESKTOP_FOLDER_ID : MOBILE_FOLDER_ID;
            const { id: driveID } = await uploadFile(filePath, mimetype, parentFolderId);

            const thumbnailID = await createAndUploadThumbnail(filePath, THUMBNAIL_FOLDER_ID);

            return { driveID, thumbnailID, tags, view };
        }));

        await AdminWallpapers.create(uploadedFiles);

        console.log('Wallpapers uploaded successfully:', uploadedFiles);
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
