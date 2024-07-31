const AdminUser = require('../models/adminUserSchema.js');
const AdminWallpapers = require('../models/adminWallpapersSchema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { uploadFile, getFile, deleteFile, resizeImage } = require('../config/googleDrive.js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const tempDir = path.join(__dirname, '..', 'temp');
const Jimp = require('jimp');
const zlib = require('zlib');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

async function uploadFileWithRetry(filePath, mimeType, parentFolderId, retryCount = 3) {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const response = await uploadFile(filePath, mimeType, parentFolderId);
            console.log(`Uploaded file ID: ${response.id}`);
            return response;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            if (attempt < retryCount) {
                console.log(`Retrying upload (attempt ${attempt + 1} of ${retryCount})...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
            } else {
                console.error('Error uploading file to Google Drive after multiple attempts:', error.message);
                throw new Error('Error uploading file to Google Drive');
            }
        }
    }
}

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

exports.getFolderId = async (view, resolutionFolder) => {
    const folderIds = {
        desktop: {
            HD: '1apf0ZWV-rDMTr_AZdznvC0M2XbLsKQ6W',
            '4K': '1ijWXnxka5qvF-1n3fhWTMC7kSvbsnYfY',
            '8K': '1zuVk0NVtokjZ10cS9idEUprjVUBF-X0w',
        },
        mobile: {
            HD: '1_XDBU8b0RiH6BUApKCLwlww7_5HlFLwH',
            '4K': '1lPlLDn29fWr6s6O5ezjycdDoXW11M_pE',
            '8K': '17HMHVoR2NUBji0IkDjv7cj_HuBATnNJZ',
        },
    };

    return folderIds[view][resolutionFolder];
}

exports.uploadWallpaper = async (file, tags, view, isPaid) => {
    try {
        const { path: filePath, mimetype } = file;

        let uploadResults = [];

        // Upload logic based on the view
        if (view === 'desktop' || view === 'mobile') {
            const originalUploadResult = await uploadFileWithRetry(filePath, mimetype, await exports.getFolderId(view, '8K'));
            if (!originalUploadResult.id) {
                throw new Error('Failed to upload original image');
            }

            const resolutions = view === 'desktop'
                ? [
                    { width: 1920, height: 1080, folder: 'HD' },
                    { width: 3840, height: 2160, folder: '4K' }
                ]
                : [
                    { width: 1080, height: 1920, folder: 'HD' },
                    { width: 2160, height: 3840, folder: '4K' }
                ];

            for (let resolution of resolutions) {
                try {
                    const resizedBuffer = await resizeImage(fs.readFileSync(filePath), resolution.width, resolution.height);
                    const tempPath = path.join(tempDir, `temp-${uuidv4()}.png`);
                    fs.writeFileSync(tempPath, resizedBuffer);

                    const folderId = await exports.getFolderId(view, resolution.folder);
                    const uploadResult = await uploadFileWithRetry(tempPath, mimetype, folderId);

                    fs.unlinkSync(tempPath);
                    uploadResults.push({ resolution: resolution.folder, driveID: uploadResult.id });
                } catch (resizeError) {
                    console.error(`Error uploading resized image for ${resolution.folder}:`, resizeError.message);
                }
            }

            uploadResults.push({ resolution: '8K', driveID: originalUploadResult.id });
        }

        console.log('Upload Results:', uploadResults);

        const driveID_HD = uploadResults.find(res => res.resolution === 'HD')?.driveID;
        const driveID_4K = uploadResults.find(res => res.resolution === '4K')?.driveID;
        const driveID_8K = uploadResults.find(res => res.resolution === '8K')?.driveID;

        if (!driveID_HD || !driveID_4K || !driveID_8K) {
            console.error('Missing drive IDs:', { driveID_HD, driveID_4K, driveID_8K });
            throw new Error('Missing one or more drive IDs');
        }

        const newWallpaper = {
            driveID_HD,
            driveID_4K,
            driveID_8K,
            thumbnailID: driveID_HD,
            tags,
            view,
            isPaid
        };

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
        const skip = (page - 1) * limit;
        const wallpapers = await AdminWallpapers.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const wallpapersWithThumbnails = await Promise.all(wallpapers.map(async (wallpaper) => {
            const thumbnailData = await getFile(wallpaper.thumbnailID);
            const image = await Jimp.read(thumbnailData);

            // Reduce the size more if the view is 'mobile'
            if (wallpaper.view === 'mobile') {
                image.resize(520, Jimp.AUTO); // Smaller size for mobile
            } else {
                image.resize(600, Jimp.AUTO); // Example size for desktop
            }

            const base64Image = await image.getBase64Async(Jimp.MIME_JPEG);

            return {
                ...wallpaper.toObject(),
                previewBase64: base64Image.replace(/^data:image\/jpeg;base64,/, ''), // Remove the base64 header
            };
        }));

        // Compress the wallpapers with gzip
        const compressedBuffer = zlib.gzipSync(Buffer.from(JSON.stringify({ wallpapers: wallpapersWithThumbnails, totalCount })));
        return { compressedBuffer, contentType: 'application/json', encoding: 'gzip' };

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

        const { driveID_HD, driveID_4K, driveID_8K, thumbnailID } = wallpaper;

        if (!driveID_HD || !driveID_4K || !driveID_8K || !thumbnailID) {
            throw new Error('Wallpaper does not contain valid drive IDs or thumbnail ID');
        }

        await deleteFile(driveID_HD);
        await deleteFile(driveID_4K);
        await deleteFile(driveID_8K);
        await deleteFile(thumbnailID);

        await AdminWallpapers.findByIdAndDelete(wallpaperId);

        console.log('Wallpaper deleted successfully:', wallpaperId);
    } catch (error) {
        console.error('Error deleting wallpaper:', error);
        throw new Error('An error occurred while deleting the wallpaper');
    }
};

exports.updateWallpaperTagsAndIsPaid = async (wallpaperId, newTags, isPaid) => {
    try {
        await AdminWallpapers.findByIdAndUpdate(wallpaperId, { tags: newTags, isPaid: isPaid });
        console.log('Tags and isPaid status updated successfully:', wallpaperId);
    } catch (error) {
        console.error('Error updating tags and isPaid status:', error);
        throw new Error('An error occurred while updating the tags and isPaid status');
    }
};

exports.getWallpaperById = async (id) => {
    try {
        const wallpaper = await AdminWallpapers.findById(id);
        if (!wallpaper) {
            throw new Error('Wallpaper not found');
        }

        console.log('Wallpaper found:', wallpaper);

        if (!wallpaper.thumbnailID) {
            throw new Error('Thumbnail ID not found on wallpaper');
        }

        console.log('Thumbnail ID:', wallpaper.thumbnailID);

        const thumbnailData = await getFile(wallpaper.thumbnailID);

        if (!thumbnailData) {
            throw new Error('Thumbnail data not found');
        }

        const base64Image = thumbnailData.toString('base64');

        return {
            ...wallpaper.toObject(),
            previewBase64: base64Image, // Base64 encoded thumbnail data
            thumbnailContentType: 'image/jpeg',
        };
    } catch (error) {
        console.error('Error fetching wallpaper by ID:', error);
        throw new Error('An error occurred while fetching the wallpaper');
    }
};

exports.sendContactEmail = async (data) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAILING_SMTP_ADDRESS,
            pass: process.env.MAILING_SMTP_APP_PASS
        }
    });

    try {
        const mailOptions = {
            from: process.env.MAILING_ADDRESS,
            to: process.env.MAILING_SMTP_RECEIVER,
            subject: 'New message from Pixel-King support',
            html: `
                <meta name="color-scheme" content="only">
                <div style="font-family: Arial, sans-serif; background-color: rgb(24, 26, 27); padding: 20px;">
                    <div style="max-width: 600px; margin: auto; background-color: #252c33; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: rgb(13, 17, 23); color: rgb(255, 255, 255); padding: 20px; text-align: center;">
                            <img src="https://i.imgur.com/QWZHeSJ.png" alt="Logo Carica Web" style="max-width: 150px; margin-bottom: 10px;">
                            <h1 style="margin: 0; font-size: 24px;"><span style="color: #009fc2">Carica Web</span><br>Servizio di Mailing - The Central Park</h1>
                        </div>
                        <div style="padding: 20px;">
                            <h2 style="color: rgb(255,255,255);">Nuovo messaggio da <span style="color: #009fc2">${data.name}</span></h2>
                            <h3 style="color: #009fc2;">Dettagli di contatto:</h3>
                            <p style="color: rgb(255,255,255);"><strong style="color: #ffffff">Email:</strong> ${data.email}</p>
                            <h3 style="color: #009fc2;">Messaggio:</h3>
                            <p style="color: #d0d0d0;">${data.message}</p>
                            <hr style="border: 0; border-top: 1px solid rgb(36, 36, 36);">
                            <p style="color: #d0d0d0; font-size: 12px; text-align: center;">
                                This is an automated message, please DO NOT reply..<br>
                                For more information ot support go to: <a href="http://www.carica.website" style="color: rgb(255,255,255);">www.carica.website</a><br>
                                Best regards,<br>Carica Web
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (err) {
        throw new Error(err.message);
    }
}

exports.authorizeUser = async (username, password) => {
    try {
        const userExists = await AdminUser.findOne({ username });
        if(userExists) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new AdminUser({ username, password: hashedPassword });
        await newUser.save();
    } catch (error) {
        console.error('Error authorizing user:', error);
        throw new Error('An error occurred while authorizing user');
    }
}

exports.deleteUser = async (username) => {
    try {
        await AdminUser.findOneAndDelete({ username });
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('An error occurred while deleting the user');
    }
};

exports.getAllUsers = async () => {
    try {
        const users = await AdminUser.find();
        return users.map(user => ({ username: user.username }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('An error occurred while fetching users');
    }
}

exports.verifyToken = (token) => {
    try {
        if(!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid token');
    }
}