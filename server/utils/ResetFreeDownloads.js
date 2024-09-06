const DownloadLog = require('../models/downloadLogSchema');

function runDailyTask() {
    DownloadLog.updateMany({}, {
        DownloadsAvailable4K: 2,
        DownloadsAvailable8K: 0
    })
        .then(() => {
            console.log('Daily task completed');
        })
        .catch(err => {
            console.error('Error running daily task:', err);
        });
}

module.exports = {
    runDailyTask
};