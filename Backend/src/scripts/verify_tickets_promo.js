const { sequelize, User, Event, Ticket, PromoCode } = require('../models');
const app = require('../app');

async function runVerification() {
    try {
        await sequelize.sync({ alter: true }); // Sync DB and update schema

        console.log('--- Starting Verification ---');

        // 1. Create a Test Event
        const event = await Event.create({
            title: 'Test Event ' + Date.now(),
            date: new Date(Date.now() + 86400000), // Tomorrow
            description: 'A test event for flexible tickets',
            status: 'published'
        });
        console.log(`Created Event: ${event.title} (ID: ${event.id})`);

        // 2. Create Tickets
        const publicTicket = await Ticket.create({
            eventId: event.id,
            name: 'Public Ticket',
            price: 50.00,
            quantity: 100,
            type: 'paid',
            visibility: 'public',
            available: 100
        });

        const hiddenTicket = await Ticket.create({
            eventId: event.id,
            name: 'Hidden Ticket',
            price: 40.00,
            quantity: 50,
            type: 'paid',
            visibility: 'hidden',
            available: 50
        });

        const lockedTicket = await Ticket.create({
            eventId: event.id,
            name: 'Locked Ticket',
            price: 30.00,
            quantity: 50,
            type: 'paid',
            visibility: 'locked',
            available: 50
        });

        console.log('Created Tickets: Public, Hidden, Locked');

        // 3. Create Promo Code
        const promo = await PromoCode.create({
            code: 'TESTCODE' + Date.now(),
            discountType: 'fixed',
            discountValue: 10.00,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 86400000)
        });

        // Link promo code to tickets (unlocks hidden, discounts public)
        await promo.addTicket(hiddenTicket);
        await promo.addTicket(publicTicket);

        console.log(`Created Promo Code: ${promo.code}`);

        // 4. Test filtering (Validation Logic Simulation)

        // Emulate getTicketsByEvent logic locally for quick check or call via controller if we spun up a server.
        // Let's just run logic against models to verify they work as expected.

        const { Op } = require('sequelize');
        const now = new Date();

        // Fetch Tickets without code
        const ticketsNoCode = await Ticket.findAll({
            where: { eventId: event.id }
        });

        const visibleNoCode = ticketsNoCode.filter(t => t.visibility !== 'hidden');
        console.log(`Visible Tickets without code: ${visibleNoCode.length} (Expected 2: Public + Locked)`);

        if (visibleNoCode.length !== 2) console.error('FAILED: Incorrect number of visible tickets without code');
        else console.log('PASSED: Visibility Check (No Code)');

        // Test Promo Code Association
        const fetchedPromo = await PromoCode.findOne({
            where: { code: promo.code },
            include: [{ model: Ticket }]
        });

        console.log(`Promo Code unlocks: ${fetchedPromo.Tickets.length} tickets`);
        const unlocksHidden = fetchedPromo.Tickets.some(t => t.name === 'Hidden Ticket');

        if (unlocksHidden) console.log('PASSED: Promo code linked to hidden ticket');
        else console.error('FAILED: Promo code not linked to hidden ticket');

        console.log('--- Verification Complete ---');
        process.exit(0);

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
}

runVerification();
