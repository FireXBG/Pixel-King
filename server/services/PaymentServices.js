const User = require('../models/usersSchema');

exports.upgradePlan = async (plan, userId) => {
    console.log('Upgrading plan:', plan, 'for user:', userId);

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.plan = plan;

        await user.save();
    } catch (error) {
        console.error('Error upgrading plan:', error);
        throw error;
    }
}
