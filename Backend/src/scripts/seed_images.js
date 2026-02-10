const { Sequelize } = require('sequelize');
const { Event } = require('../models');
require('dotenv').config();

const updateImages = async () => {
    try {
        const events = await Event.findAll();
        const images = [
            '/uploads/event1.webp',
            '/uploads/event2.webp',
            '/uploads/event3.webp'
        ];

        let i = 0;
        for (const event of events) {
            // Assign images in round-robin fashion
            const imagePath = images[i % images.length];
            event.imageUrl = imagePath;
            await event.save();
            console.log(`Updated Event ${event.id} with image ${imagePath}`);
            i++;
        }

        console.log('All events updated with sample images.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating images:', error);
        process.exit(1);
    }
};

updateImages();
