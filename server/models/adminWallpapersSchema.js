const { Schema, model } = require('mongoose');

const adminWallpapersSchema = new Schema({
    driveID_HD: {
        type: String,
        required: true
    },
    driveID_4K: {
        type: String,
        required: true
    },
    driveID_8K: {
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
    },
    isPaid: {
        type: Boolean,
        required: true
    },
}, { timestamps: true });

const AdminWallpapers = model('AdminWallpapers', adminWallpapersSchema);

module.exports = AdminWallpapers;