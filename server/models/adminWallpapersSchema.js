const { Schema, model } = require('mongoose');

const adminWallpapersSchema = new Schema({
    driveID: {
        type: String,
        required: true
    },
    thumbnailID: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    view: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Add timestamps

const AdminWallpapers = model('AdminWallpapers', adminWallpapersSchema);

module.exports = AdminWallpapers;
