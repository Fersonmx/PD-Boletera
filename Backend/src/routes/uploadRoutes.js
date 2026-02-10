const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { uploadImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/upload
// Protect this route so only authenticated users (or admins) can upload
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;
