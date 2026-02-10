const sequelize = require('../config/db');
require('../models'); // Load models

async function updateSchema() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // Sync with alter: true to update tables without dropping them
        await sequelize.sync({ alter: true });
        console.log('✅ Database schema updated successfully.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database schema:', error);
        process.exit(1);
    }
}

updateSchema();
