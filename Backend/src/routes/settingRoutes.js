const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getSettings);
router.put('/', protect, admin, updateSetting);

module.exports = router;
