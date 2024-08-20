const User = require('../models/usersSchema');

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