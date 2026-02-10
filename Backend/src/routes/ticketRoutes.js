const express = require('express');
const router = express.Router();
const { createTicket, getTicketsByEvent, updateTicket, deleteTicket, getSecureCode } = require('../controllers/ticketController');
const { getAppleWalletPass, getGoogleWalletLink } = require('../controllers/walletController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/secure-code/:ticketId', protect, getSecureCode);
router.get('/:ticketId/wallet/apple', protect, getAppleWalletPass);
router.get('/:ticketId/wallet/google', protect, getGoogleWalletLink);

router.post('/', protect, admin, createTicket);
router.get('/event/:eventId', getTicketsByEvent);
router.put('/:id', protect, admin, updateTicket);
router.delete('/:id', protect, admin, deleteTicket);

module.exports = router;
