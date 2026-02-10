const { PromoCode, Event } = require('../models');
const { Op } = require('sequelize');

// --- Helper: Validate Logic ---
const checkPromoCode = async (codeName, subtotal, eventId) => {
    // Find Code
    const promo = await PromoCode.findOne({
        where: { code: codeName }
    });

    if (!promo) {
        return { valid: false, message: 'Code not found' };
    }

    // Check Limits
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
        return { valid: false, message: 'Code usage limit reached' };
    }

    // Check Dates
    const now = new Date();
    if (promo.validFrom && now < promo.validFrom) {
        return { valid: false, message: 'Code not active yet' };
    }
    if (promo.validUntil && now > promo.validUntil) {
        return { valid: false, message: 'Code expired' };
    }

    // Check Event Scope (Optional)
    // If promo.eventId is set, it only applies if the order contains at least one ticket from that event
    // For MVP we assume global or we passed eventId to validate.
    // If incoming eventId is provided (e.g. context of cart), check match.
    if (promo.eventId && eventId && promo.eventId != eventId) {
        return { valid: false, message: 'Code not applicable for this event' };
    }

    // Calculate Discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
        discount = (subtotal * promo.discountValue) / 100;
    } else {
        discount = parseFloat(promo.discountValue);
    }

    // Cap discount at subtotal (cannot be negative)
    if (discount > subtotal) discount = subtotal;

    return {
        valid: true,
        discountAmount: discount,
        finalTotal: subtotal - discount,
        promoCode: promo
    };
};

exports.validatePromoCode = async (req, res) => {
    try {
        const { code, subtotal, eventId } = req.body;
        if (!code) return res.status(400).json({ message: 'Code is required' });

        const result = await checkPromoCode(code, subtotal || 0, eventId);

        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        res.json({
            valid: true,
            code: result.promoCode.code,
            discountType: result.promoCode.discountType,
            discountValue: result.promoCode.discountValue,
            discountAmount: result.discountAmount,
            newTotal: result.finalTotal
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createPromoCode = async (req, res) => {
    try {
        const { code, discountType, discountValue, usageLimit, validUntil, eventId } = req.body;

        const existing = await PromoCode.findOne({ where: { code } });
        if (existing) return res.status(400).json({ message: 'Code already exists' });

        const promo = await PromoCode.create({
            code,
            discountType, // 'percentage' or 'fixed'
            discountValue,
            usageLimit,
            validUntil,
            eventId
        });

        res.status(201).json(promo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPromoCodes = async (req, res) => {
    try {
        const promos = await PromoCode.findAll({ order: [['createdAt', 'DESC']] });
        res.json(promos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deletePromoCode = async (req, res) => {
    try {
        const { id } = req.params;
        await PromoCode.destroy({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Export helper for use in orderController
exports.checkPromoCodeHelper = checkPromoCode;
