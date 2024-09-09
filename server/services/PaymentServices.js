const User = require('../models/usersSchema');
const mongoose = require("mongoose");
const {mongo} = require("mongoose");

exports.upgradePlan = async (plan, userId, customerId) => {
    console.log('Upgrading plan:', plan, 'for user:', userId);

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.plan = plan;
        if (customerId) {
            user.customer_id = customerId;
        }

        await user.save();
    } catch (error) {
        console.error('Error upgrading plan:', error);
        throw error;
    }
}

exports.resetPlan = async (userId) => {
    console.log('Resetting plan for user:', userId);

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.plan = 'free';

        await user.save();
    } catch (error) {
        console.error('Error resetting plan:', error);
        throw error;
    }
}

exports.addPixels = async (userId, selectedPlan, customQuantity) => {
    console.log(userId);
    console.log(selectedPlan);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId format');
    }

    const mongooseId = new mongoose.Types.ObjectId(userId);

    try {
        const user = await User.findById(mongooseId);
        if (!user) {
            throw new Error('User not found');
        }

        const currentPixels = user.credits || 0;
        let pixels = 0;

        if (selectedPlan === 'Custom') {
            pixels = customQuantity;
        } else {
            switch (selectedPlan) {
                case 'Premium': {
                    pixels = 60;
                    break;
                }
                case 'King': {
                    pixels = 125;
                    break;
                }
                default: {
                    throw new Error('Invalid plan selected');
                }
            }
        }

        user.credits = currentPixels + pixels;
        await user.save();
    } catch (error) {
        console.error('Error adding pixels:', error);
        throw error;
    }
}