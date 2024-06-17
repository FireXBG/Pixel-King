const AdminUser = require('../models/adminUserSchema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (username, password) => {
    const user = await AdminUser.findOne({ username });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new Error('Invalid credentials');
    }

    return jwt.sign({username}, process.env.JWT_SECRET, {expiresIn: '1h'});
}