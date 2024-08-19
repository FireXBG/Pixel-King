const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    plan: {
        type: String,
        required: true,
        enum: ['free', 'Premium', 'King'],
        default: 'free'
    },
    credits: {
        type: Number,
        default: 0
    },
    favouriteWallpapers: [{
        type: Schema.Types.ObjectId,
        ref: 'AdminWallpapers'
    }]
})

module.exports = model('User', userSchema);