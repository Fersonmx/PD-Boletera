const { sequelize, Order, OrderItem, OrderTicket } = require('../models');
// Using a mock UUID generator if require('uuid') fails in CJS, or just use dynamic import
// but simpler here:
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

async function backfillTickets() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const orders = await Order.findAll({
            include: [OrderItem]
        });

        console.log(`Checking ${orders.length} orders...`);

        for (const order of orders) {
            const existingTickets = await OrderTicket.count({ where: { orderId: order.id } });

            if (existingTickets > 0) {
                console.log(`Order ${order.id} already has tickets. Skipping.`);
                continue;
            }

            console.log(`Backfilling tickets for Order ${order.id}...`);

            for (const item of order.OrderItems) {
                for (let i = 0; i < item.quantity; i++) {
                    await OrderTicket.create({
                        orderId: order.id,
                        ticketId: item.ticketId,
                        uniqueCode: uuidv4(),
                        qrSecret: crypto.randomBytes(20).toString('hex')
                    });
                }
            }
        }

        console.log('✅ Backfill complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

backfillTickets();
