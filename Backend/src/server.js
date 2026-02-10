const app = require('./app');
const sequelize = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // Sync logic helps during dev, but rely on init_db.js for robust setup
        await sequelize.sync(); // Removed alter: true to avoid ER_TOO_MANY_KEYS

        // Register routes
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/users', require('./routes/userRoutes'));
        app.use('/api/events', require('./routes/eventRoutes'));
        app.use('/api/venues', require('./routes/venueRoutes'));
        app.use('/api/categories', require('./routes/categoryRoutes'));
        app.use('/api/tickets', require('./routes/ticketRoutes'));
        app.use('/api/orders', require('./routes/orderRoutes'));
        app.use('/api/settings', require('./routes/settingRoutes'));
        app.use('/api/promocodes', require('./routes/promoCodeRoutes'));
        app.use('/api/content', require('./routes/contentRoutes'));
        app.use('/api/upload', require('./routes/uploadRoutes')); // Ensuring upload is there too if needed

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
}

startServer();
