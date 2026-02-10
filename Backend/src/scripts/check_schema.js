const sequelize = require('../config/db');

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected.');
        const [results] = await sequelize.query('DESCRIBE Orders');
        console.table(results);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
