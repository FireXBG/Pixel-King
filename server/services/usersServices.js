const User = require('../models/usersSchema');
const DownloadLog = require('../models/downloadLogSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

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

        if (userRegistered) {
            throw new Error('Username already taken');
        }

        if (emailRegistered) {
            throw new Error('Email already registered');
        }

        const hashedPass = await bcrypt.hash(data.password, 12);

        // Create the user instance but do not save yet
        const user = new User({
            username: data.username,
            email: data.email,
            password: hashedPass,
            plan: 'free'
        });

        // Save the user to get the _id
        await user.save();

        // Now that the user is saved and has an _id, create the download log
        const downloadLog = new DownloadLog({
            userId: user._id,
            DownloadsAvailable4K: 10, // Default values
            DownloadsAvailable8K: 0   // Default values
        });

        // Save the download log
        await downloadLog.save();

        // Return the JWT token
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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

exports.chargePixels = async (userId, pixels) => {
    const user = await User.findById(userId);

    try {
        if (!user) {
            throw new Error('User not found');
        }

        console.log(user)

        user.credits -= pixels;

        if(user.credits < 0) {
            throw new Error('Not enough credits');
        }

        await user.save();
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.hasFreeDownloads = async (userId, resolution) => {
    const logsObj = await DownloadLog.find({ userId: userId});
    const user = await User.findById(userId);
    const logs = logsObj[0];
    try {
        if(!logs) {
            throw new Error('Logs not found for this user!');
        }

        if(resolution === '4K') {
            if(user.plan === 'Premium' || user.plan === 'King') {
                return true;
            }
            return logs.DownloadsAvailable4K > 0;

        } else if (resolution === '8K') {
            if(user.plan === 'King') {
                return true;
            }
            return logs.DownloadsAvailable8K > 0;
        }

    } catch (error) {
        throw new Error('An error occurred while checking free downloads');
    }
}

exports.useFreeDownload = async (userId, resolution) => {
    const logs = await DownloadLog.findOne({ userId: userId });

    console.log(logs)

    try {
        if(!logs) {
            throw new Error('Logs not found for this user!');
        }

        if(resolution === '4K') {
            logs.DownloadsAvailable4K -= 1;
        } else if (resolution === '8K') {
            logs.DownloadsAvailable8K -= 1;
        }

        await logs.save();
    } catch (error) {
        throw new Error('An error occurred while using a free download: ' + error.message);
    }
}

exports.getFreeDownloads = async (userId) => {
    try {
        console.log(userId)
        const logs = await DownloadLog.findOne({ userId: userId });

        return {
            DownloadsAvailable4K: logs.DownloadsAvailable4K,
            DownloadsAvailable8K: logs.DownloadsAvailable8K
        }
    } catch (error) {
        throw new Error(error);
    }
}

exports.updateUserById = async (id, updatedFields) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // Update user fields
        if (updatedFields.username) user.username = updatedFields.username;
        if (updatedFields.email) user.email = updatedFields.email;
        if (updatedFields.password) user.password = updatedFields.password; // Hash password if needed
        if (updatedFields.plan) user.plan = updatedFields.plan;
        if (updatedFields.credits) user.credits = updatedFields.credits;

        await user.save();
        return user;
    } catch (error) {
        throw new Error('Error updating user:', error);
    }
};