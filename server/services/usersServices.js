const User = require('../models/usersSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (data) => {
    try {
        const user = await User.findOne({ username: data.username }).select('+password');

        if(!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if(!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        return jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
    } catch (error) {
        console.error("Error during user login:", error);
        throw new Error(error.message || 'An error occurred during login');
    }
}

exports.register = async (data) => {
    try {
        const userRegistered = await User.findOne({ username: data.username });
        const emailRegistered = await User.findOne({ email: data.email });

        if(userRegistered) {
            throw new Error('Username already taken');
        }

        if(emailRegistered) {
            throw new Error('Email already registered');
        }

        const hashedPass = await bcrypt.hash(data.password, 12);

        const user = new User({
            username: data.username,
            email: data.email,
            password: hashedPass,
            plan: 'free'
        });

        await user.save();

        return jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
    } catch (error) {
        console.error("Error during user saving process:", error);
        throw new Error(error.message || 'An error occurred during registration');
    }
};

exports.userInfo = async (token) => {
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const user = await User.findById(userId);

    if(!user) {
        throw new Error('User not found');
    }

    return {
        username: user.username,
        email: user.email,
        plan: user.plan,
        credits: user.credits
    };
}
