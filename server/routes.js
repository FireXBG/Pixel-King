const router = require('express').Router();
const adminController = require('./controllers/adminController');

router.use(adminController);

module.exports = router;