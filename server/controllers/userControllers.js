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

router.get('/info', async (req, res) => {
    const token = req.headers.authorization;
    try {
        const userInfo = await userServices.userInfo(token);
        console.log(userInfo);
        res.status(200).json(userInfo);
    } catch (error) {
        console.error("Error during user info:", error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/updateUserInfo', async (req, res) => {
    const data = req.body;
    const token = req.headers.authorization;
    try {
        const updatedUserInfo = await userServices.updateUserInfo(data, token);
        res.status(200).json(updatedUserInfo);
    } catch (error) {
        console.error("Error during user info update:", error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/updatePassword', async (req, res) => {
    const data = req.body;
    const token = req.headers.authorization;
    try {
        const updatedPassword = await userServices.updatePassword(data, token);
        res.status(200).json(updatedPassword);
    } catch (error) {
        console.error("Error during user password update:", error);
        res.status(500).json({ error: error.message });
    }
})


module.exports = router;