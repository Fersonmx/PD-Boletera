const { sequelize, Category, Venue, User } = require('../models');
require('dotenv').config();

async function seedCatalogs() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        // Seed Category
        const categoryCount = await Category.count();
        if (categoryCount === 0) {
            await Category.bulkCreate([
                { name: 'Concerts', slug: 'concerts', imageUrl: 'https://images.unsplash.com/photo-1459749411177-273a48add901?auto=format&fit=crop&q=80' },
                { name: 'Sports', slug: 'sports', imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80' },
                { name: 'Theater', slug: 'theater', imageUrl: 'https://images.unsplash.com/photo-1507676184212-d033912996c7?auto=format&fit=crop&q=80' }
            ]);
            console.log('✅ Categories seeded');
        } else {
            console.log('ℹ️ Categories already exist');
        }

        // Seed Venue
        const venueCount = await Venue.count();
        if (venueCount === 0) {
            await Venue.bulkCreate([
                { name: 'Madison Square Garden', address: '4 Penn Plaza', city: 'New York', capacity: 20000 },
                { name: 'Wembley Stadium', address: 'London HA9 0WS', city: 'London', capacity: 90000 },
                { name: 'Estadio Azteca', address: 'Tlalpan', city: 'Mexico City', capacity: 87000 }
            ]);
            console.log('✅ Venues seeded');
        } else {
            console.log('ℹ️ Venues already exist');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedCatalogs();
