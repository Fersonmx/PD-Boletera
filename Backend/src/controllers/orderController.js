const { checkPromoCodeHelper } = require('./promoCodeController');
const { Order, OrderItem, Ticket, User, Event, OrderTicket, Venue, Category } = require('../models');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

exports.createOrder = async (req, res) => {
    try {
        const { items, guestInfo, promoCode } = req.body; // items: [{ ticketId, quantity }], guestInfo: { name, email }, promoCode: string

        let userId = null;
        if (req.user) {
            userId = req.user.id;
        }

        // Validate: Must have User OR Guest Info
        if (!userId && (!guestInfo || !guestInfo.name || !guestInfo.email)) {
            return res.status(400).json({ message: 'User must be logged in or provide guest information' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // Calculate total and verify availability
        let subtotal = 0;
        const processedItems = [];
        // We need eventId for promo validation if specific. Taking from first item.
        let eventId = null;

        for (const item of items) {
            const ticket = await Ticket.findByPk(item.ticketId);
            if (!ticket) {
                return res.status(404).json({ message: `Ticket ${item.ticketId} not found` });
            }
            if (!eventId) eventId = ticket.eventId; // Capture event scope

            if (ticket.available < item.quantity) {
                return res.status(400).json({ message: `Not enough tickets available for ${ticket.name}` });
            }

            subtotal += ticket.price * item.quantity;
            processedItems.push({ ticket, quantity: item.quantity });
        }

        // --- Promo Code Logic ---
        let discountAmount = 0;
        let finalTotal = subtotal;
        let validPromo = null;

        if (promoCode) {
            const promoResult = await checkPromoCodeHelper(promoCode, subtotal, eventId);
            if (!promoResult.valid) {
                return res.status(400).json({ message: `Promo Code Error: ${promoResult.message}` });
            }
            discountAmount = promoResult.discountAmount;
            finalTotal = promoResult.finalTotal;
            validPromo = promoResult.promoCode;
        }

        // Create Order
        const orderData = {
            totalAmount: finalTotal,
            discountAmount: discountAmount,
            promoCodeUsed: promoCode || null,
            status: finalTotal === 0 ? 'completed' : 'pending', // Auto-complete if free
            paymentIntentId: finalTotal === 0 ? 'free_promo' : ('mvn_placeholder_' + Date.now())
        };

        if (userId) {
            orderData.userId = userId;
        } else {
            orderData.guestName = guestInfo.name;
            orderData.guestEmail = guestInfo.email;
        }

        const order = await Order.create(orderData);

        // Update Promo Usage
        if (validPromo) {
            await validPromo.increment('usedCount');
        }

        // Create OrderItems, OrderTickets and Update Ticket Availability
        for (const item of processedItems) {
            // 1. Create Order Item (Summary)
            await OrderItem.create({
                orderId: order.id,
                ticketId: item.ticket.id,
                quantity: item.quantity,
                price: item.ticket.price
            });

            // 2. Create Individual Order Tickets (Unique Codes)
            for (let i = 0; i < item.quantity; i++) {
                await OrderTicket.create({
                    orderId: order.id,
                    ticketId: item.ticket.id,
                    uniqueCode: uuidv4(),
                    qrSecret: crypto.randomBytes(20).toString('hex') // Secret for dynamic code
                });
            }

            // 3. Update Availability
            await item.ticket.update({ available: item.ticket.available - item.quantity });
        }

        res.status(201).json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const { Op } = require('sequelize');

exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const whereClause = {};
        // If we are searching by User fields, we need to pass a specific `where` to the User include.
        const userInclude = { model: User, attributes: ['id', 'name', 'email'] };

        if (search) {
            if (!isNaN(search)) {
                // If numeric, assume searching by Order ID
                whereClause.id = search;
            } else {
                // If string, assume searching by User Name or Email
                userInclude.where = {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                };
                userInclude.required = true; // Inner join to filter orders by user match
            }
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                userInclude,
                {
                    model: OrderItem,
                    include: [{ model: Ticket, include: [Event] }]
                },
                { model: OrderTicket }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            distinct: true
        });

        res.json({
            orders: rows,
            total: count,
            page: page,
            pages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: OrderItem,
                    include: [{ model: Ticket, include: [Event] }]
                },
                {
                    model: OrderTicket,
                    include: [{
                        model: Ticket,
                        include: [
                            { model: Event, include: [Venue, Category] }
                        ]
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
