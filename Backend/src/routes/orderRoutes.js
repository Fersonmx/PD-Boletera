const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getMyOrders } = require('../controllers/orderController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createOrder);
router.get('/', protect, admin, getOrders);
router.get('/myorders', protect, getMyOrders);

module.exports = router;
