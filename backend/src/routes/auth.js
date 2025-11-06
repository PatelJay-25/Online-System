const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, resendOtp } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);

module.exports = router; 