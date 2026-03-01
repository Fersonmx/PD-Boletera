const { Event, Ticket } = require('./src/models');
const { updateEvent } = require('./src/controllers/eventController');

async function test() {
    // 1. mock req, res
    const req = {
        params: { id: 11 },
        body: {
            title: 'Test Update',
            date: new Date().toISOString(),
            venueId: 3, // Estadio Azteca
            layoutId: 3, // Standard Config
            ticketConfigs: [
                { sectionId: 7, price: 100 },
                { sectionId: 8, price: 200 },
                { sectionId: 9, price: 300 }
            ]
        }
    };
    const res = {
        status: (code) => res,
        json: (data) => console.log('Response:', data),
    };
    
    // Call controller
    await updateEvent(req, res);
    
    // Check tickets
    const tickets = await Ticket.findAll({ where: { eventId: 11 } });
    console.log('Tickets after update:', tickets.map(t => ({ id: t.id, sectionId: t.sectionId, price: t.price })));
}

test().catch(console.error);
