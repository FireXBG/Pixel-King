const router = require('express').Router();
const bcrypt = require('bcryptjs');
const adminServices = require('../services/adminServices');

router.post('/login', async (req, res) => {
    const data = req.body;

    try {
        const token = await adminServices.login(data.username, data.password);
        console.log('Admin logged in:', data.username);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);

        if (error.message === 'Invalid credentials') {
            res.status(401).json({
                error: 'Invalid username or password.'
            });
        } else {
            res.status(500).json({
                error: 'An error occurred. Please try again later.'
            });
        }
    }
});

module.exports = router;