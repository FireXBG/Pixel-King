const { Schema, model } = require('mongoose');

const adminEmailsSchema = new Schema({
    email: {
        type: String,
        required: true,
    }
});

module.exports = model('AdminEmails', adminEmailsSchema);