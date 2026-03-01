const { Event } = require('./src/models');
const { deleteEvent } = require('./src/controllers/eventController');

async function test() {
    // 1. mock req, res
    const req = {
        params: { id: 11 }
    };
    const res = {
        status: (code) => { console.log('Status:', code); return res; },
        json: (data) => console.log('Response:', data),
    };
    
    // Call controller
    await deleteEvent(req, res);
}

test().catch(console.error);
