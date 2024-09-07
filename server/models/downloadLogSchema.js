const { Schema, model } = require('mongoose');

const downloadLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    DownloadsAvailable4K: {
        type: Number,
        default: 2
    },
    DownloadsAvailable8K: {
        type: Number,
        default: 0
    }
});

const DownloadLog = model('DownloadLog', downloadLogSchema);

module.exports = DownloadLog;