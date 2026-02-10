const mysql = require('mysql2/promise');
const { sequelize, User, Setting } = require('../models');
require('dotenv').config();

async function initializeDatabase() {
    try {
        // 1. Create Database if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`✅ Database ${process.env.DB_NAME} checked/created.`);
        await connection.end();

        // 2. Sync Sequelize Models
        await sequelize.authenticate();
        console.log('✅ Connected to Database via Sequelize.');

        // Sync all models (User, etc.)
        // alter: true updates tables if they exist, force: true drops them.
        // We use alter: true for safety in dev, or force: true for fresh start if argument provided.
        // Initialize standard models
        await sequelize.sync({ alter: true }); // Use alter to add columns without dropping
        console.log('✅ Database synced (altered).');

        // Seed Initial Settings if not exist
        const setting = await Setting.findOne({ where: { key: 'enable_2fa_registration' } });
        if (!setting) {
            await Setting.create({
                key: 'enable_2fa_registration',
                value: 'false',
                description: 'Enable SMS Two-Factor Authentication during registration'
            });
            console.log('Initialized default settings.');
        }

        // 3. Seed Admin User
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPass = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME;

        if (!adminEmail || !adminPass) {
            console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env, skipping admin seed.');
            return;
        }

        const adminExists = await User.findOne({ where: { email: adminEmail } });
        if (!adminExists) {
            await User.create({
                name: adminName || 'Admin',
                email: adminEmail,
                password: adminPass,
                role: 'admin'
            });
            console.log(`✅ Admin User created: ${adminEmail}`);
        } else {
            console.log('ℹ️ Admin User already exists.');
        }

        console.log('🚀 API Setup Complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
