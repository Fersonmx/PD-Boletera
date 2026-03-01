const express = require('express');
const router = express.Router();
const { register, login, verifySms, googleAuth, updateProfile, updatePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-sms', authLimiter, verifySms);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// Example protected route for testing
router.get('/me', protect, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
