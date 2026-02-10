const { sequelize, Event, Ticket, Category, Venue, VenueLayout, VenueSection } = require('../models');
require('dotenv').config();

async function seedEvents() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const eventCount = await Event.count();
        if (eventCount === 0) {
            // Get references
            const category = await Category.findOne();
            const venue = await Venue.findOne({
                include: [{
                    model: VenueLayout,
                    as: 'layouts',
                    include: [{ model: VenueSection, as: 'sections' }]
                }]
            });

            if (!category || !venue) {
                console.error('❌ Categories or Venues missing. Run seed_catalogs.js and seed_layouts.js first.');
                process.exit(1);
            }

            const layout = venue.layouts && venue.layouts.length > 0 ? venue.layouts[0] : null;
            if (!layout) {
                console.error('❌ Venue has no layouts. Run seed_layouts.js first.');
                process.exit(1);
            }

            // Create Event
            const event = await Event.create({
                title: 'Summer Music Festival 2025',
                description: 'The biggest music festival of the year featuring top artists from around the world. Join us for 3 days of music, food, and fun!',
                date: new Date('2025-07-15T18:00:00'),
                imageUrl: 'https://images.unsplash.com/photo-1459749411177-273a48add901?auto=format&fit=crop&q=80',
                status: 'published',
                categoryId: category.id,
                venueId: venue.id,
                layoutId: layout.id
            });
            console.log('✅ Event populated: Summer Music Festival');

            // Create Tickets based on Layout Sections
            // We map sections to arbitrary prices for this seed
            const ticketData = layout.sections.map(section => {
                let price;
                if (section.name.includes('VIP')) price = 450;
                else if (section.name.includes('Upper')) price = 80;
                else price = 150; // General

                return {
                    eventId: event.id,
                    sectionId: section.id,
                    name: section.name,
                    price: price,
                    quantity: section.capacity,
                    available: section.capacity
                };
            });

            await Ticket.bulkCreate(ticketData);
            console.log('✅ Tickets populated from Layout Sections');

        } else {
            console.log('ℹ️ Events already exist');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedEvents();
