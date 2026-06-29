const express = require('express');
const router = express.Router();
const { signup, login, googleAuth, adminLogin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/google', googleAuth);

module.exports = router;
