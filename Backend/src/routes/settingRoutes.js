const express = require('express');
const router = express.Router();
const { getSettings, updateSetting, testEmailConfig, getEmailLogs } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getSettings);
router.put('/', protect, admin, updateSetting);
router.post('/test-email', protect, admin, testEmailConfig);
router.get('/email-logs', protect, admin, getEmailLogs);

module.exports = router;
