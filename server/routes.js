const router = require('express').Router();
const adminController = require('./controllers/adminController');
const usersControllers = require('./controllers/userControllers');

router.use(adminController);
router.use('/users', usersControllers)

module.exports = router;