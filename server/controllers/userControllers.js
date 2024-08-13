const express = require('express');
const router = express.Router();
const userServices = require('../services/usersServices')

router.post('/login', async (req, res) => {
    const data = req.body;
    try {
        const token = await userServices.login(data);
        res.status(200).json(token);
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/register', async (req, res) => {
    const data = req.body;
    try {
        const token = await userServices.register(data);
        res.status(201).json(token);
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;