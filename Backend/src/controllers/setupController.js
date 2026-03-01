const { User, Setting, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Helper to check if setup is needed
const isSetupNeeded = async () => {
    // Check if any admin user exists
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) return true;

    // Check if setup_completed setting is true
    const setupSetting = await Setting.findOne({ where: { key: 'setup_completed' } });
    if (!setupSetting || setupSetting.value !== 'true') return true;

    return false;
};

exports.getSetupStatus = async (req, res) => {
    try {
        const needsSetup = await isSetupNeeded();
        res.json({ setupRequired: needsSetup });
    } catch (error) {
        console.error('Error checking setup status:', error);
        res.status(500).json({ error: 'Internal server error checking setup status' });
    }
};

exports.performSetup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        if (!(await isSetupNeeded())) {
            await t.rollback();
            return res.status(400).json({ error: 'Setup already completed' });
        }

        const { adminName, adminEmail, adminPassword, stripePublicKey, stripeSecretKey } = req.body;

        if (!adminName || !adminEmail || !adminPassword) {
            await t.rollback();
            return res.status(400).json({ error: 'Admin details are required' });
        }

        // 1. Create Admin User
        // Check if user exists (to be safe, though isSetupNeeded checked admin role)
        let user = await User.findOne({ where: { email: adminEmail }, transaction: t });
        if (user) {
            // If user exists but not admin, maybe upgrade? For now, let's assume clean slate or just error if conflict
            await t.rollback();
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        }, { transaction: t });

        // 2. Save Stripe Settings
        if (stripePublicKey) {
            await Setting.upsert({
                key: 'stripe_public_key',
                value: stripePublicKey,
                description: 'Stripe Public Key'
            }, { transaction: t });
        }
        if (stripeSecretKey) {
            await Setting.upsert({
                key: 'stripe_secret_key',
                value: stripeSecretKey,
                description: 'Stripe Secret Key'
            }, { transaction: t });
        }

        // 3. Mark Setup as Complete
        await Setting.upsert({
            key: 'setup_completed',
            value: 'true',
            description: 'System Initial Setup Completed'
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Setup completed successfully' });

    } catch (error) {
        await t.rollback();
        console.error('Error performing setup:', error);
        res.status(500).json({ error: 'Internal server error performing setup' });
    }
};
