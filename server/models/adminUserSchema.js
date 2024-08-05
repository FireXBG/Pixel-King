const { Schema, model } = require('mongoose');

const adminUserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
})

const AdminUser = model('AdminUser', adminUserSchema);

module.exports = AdminUser;