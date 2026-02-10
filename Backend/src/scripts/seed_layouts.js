const { sequelize, Venue, VenueLayout, VenueSection } = require('../models');
require('dotenv').config();

async function seedLayouts() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const venues = await Venue.findAll({ include: [{ model: VenueLayout, as: 'layouts', include: ['sections'] }] });

        for (const venue of venues) {
            let layout = venue.layouts && venue.layouts.length > 0 ? venue.layouts[0] : null;

            if (!layout) {
                console.log(`Creating Default Layout for ${venue.name}...`);
                layout = await VenueLayout.create({
                    venueId: venue.id,
                    name: 'Standard Configuration',
                    imageUrl: 'https://cdn.pixabay.com/photo/2021/01/18/12/48/seating-plan-5928173_1280.png'
                });
            } else {
                console.log(`Checking layout for ${venue.name}...`);
            }

            // Define default visual data
            // Simple generic layout: VIP (Top), General (Middle), Upper (Bottom)
            const visualDataMap = {
                'VIP Circle': 'M150,50 L350,50 L350,150 L150,150 Z', // Top Center Box
                'General Admission': 'M50,200 L450,200 L450,350 L50,350 Z', // Large Middle Box
                'Upper Tier': 'M50,400 L450,400 L450,480 L50,480 Z' // Bottom Strip
            };

            // Check if sections need creation or update
            if (layout.sections && layout.sections.length > 0) {
                for (const section of layout.sections) {
                    if (!section.visualData && visualDataMap[section.name]) {
                        console.log(`Updating visualData for ${section.name}`);
                        section.visualData = visualDataMap[section.name];
                        await section.save();
                    }
                }
            } else {
                console.log(`Creating sections for ${venue.name}...`);
                const sections = [
                    {
                        layoutId: layout.id,
                        name: 'VIP Circle',
                        capacity: 100,
                        visualData: visualDataMap['VIP Circle']
                    },
                    {
                        layoutId: layout.id,
                        name: 'General Admission',
                        capacity: Math.floor(venue.capacity * 0.4),
                        visualData: visualDataMap['General Admission']
                    },
                    {
                        layoutId: layout.id,
                        name: 'Upper Tier',
                        capacity: Math.floor(venue.capacity * 0.5),
                        visualData: visualDataMap['Upper Tier']
                    }
                ];
                await VenueSection.bulkCreate(sections);
            }
            console.log(`✅ Layout processed for ${venue.name}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedLayouts();
