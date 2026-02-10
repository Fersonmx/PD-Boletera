const express = require('express');
const router = express.Router();
const promoCodeController = require('../controllers/promoCodeController');

router.post('/validate', promoCodeController.validatePromoCode);
router.post('/', promoCodeController.createPromoCode);
router.get('/', promoCodeController.getPromoCodes);
router.delete('/:id', promoCodeController.deletePromoCode);

module.exports = router;
