const { Setting } = require('../models');

exports.getConfig = async (req, res) => {
    try {
        const stripePublicKey = await Setting.findOne({ where: { key: 'stripe_public_key' } });

        if (!stripePublicKey) {
            return res.status(404).json({ message: 'Stripe Public Key not found' });
        }

        res.json({
            publishableKey: stripePublicKey.value
        });
    } catch (error) {
        console.error('Error fetching Stripe config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
