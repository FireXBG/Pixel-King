const router = require('express').Router();
const adminController = require('./controllers/adminController');

router.use('/admin', adminController);

module.exports = router;