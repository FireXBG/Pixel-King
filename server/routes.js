const express = require('express');
const adminController = require('./controllers/adminController');
const usersControllers = require('./controllers/userControllers');
const paymentControllers = require('./controllers/paymentControllers');

const router = express.Router();

router.use(adminController);
router.use('/users', usersControllers);

module.exports = router;
