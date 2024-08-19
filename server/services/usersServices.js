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

exports.updateUserInfo = async (data, token) => {
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if data is the same as the current user data
    const usernameIsTheSame = data.username === user.username;
    const emailIsTheSame = data.email === user.email;

    if (usernameIsTheSame && emailIsTheSame) {
        throw new Error('Username and Email are the same as the current ones. No changes made.');
    }

    // Check if the username is being updated and is taken by another user
    if (!usernameIsTheSame) {
        const userExists = await User.findOne({ username: data.username });
        if (userExists) {
            throw new Error('Username is already taken! Please try another one');
        }
    }

    // Check if the email is being updated and is taken by another user
    if (!emailIsTheSame) {
        const emailExists = await User.findOne({ email: data.email });
        if (emailExists) {
            throw new Error('Email is already taken. Please try another one.');
        }
    }

    // Update the user's data
    user.username = data.username;
    user.email = data.email;

    console.log('Updated username:', user.username);
    console.log('Updated email:', user.email);

    await user.save();

    return {
        username: user.username,
        email: user.email
    };
}

exports.updatePassword = async (data, token) => {
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const user = await User.findById(userId).select('+password');

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isPasswordValid) {
        throw new Error('Current password is incorrect! Please try again');
    }

    user.password = await bcrypt.hash(data.newPassword, 12);

    await user.save();

    return {
        message: 'Password updated successfully'
    };
}