const { OrderTicket, Ticket, Event, User, Order } = require('../models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// --- Standard Ticket Management (Admin) ---

exports.createTicket = async (req, res) => {
    try {
        const { name, price, quantity, eventId, available } = req.body;

        // Basic validation
        if (!eventId) return res.status(400).json({ message: 'Event ID required' });

        const ticket = await Ticket.create({
            name,
            price,
            quantity,
            available: available !== undefined ? available : quantity,
            eventId
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTicketsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const tickets = await Ticket.findAll({ where: { eventId } });
        res.json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        await ticket.update(req.body);
        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        await ticket.destroy();
        res.json({ message: 'Ticket deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Secure Logic (Public/Admin) ---

exports.getSecureCode = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        // 1. Find Ticket and verify ownership
        // We need to fetch the OrderTicket and ensure it belongs to an Order owned by the User
        const orderTicket = await OrderTicket.findOne({
            where: { id: ticketId },
            include: [
                {
                    model: Ticket,
                    include: [Event]
                },
                {
                    model: Order,
                    where: { userId: userId }, // Direct DB check for ownership
                    required: true // Inner join ensures only tickets owned by user are found
                }
            ]
        });

        if (!orderTicket) {
            // If not found, either it doesn't exist OR it doesn't belong to the user
            // Security by obscurity: generic 404 is fine.
            return res.status(404).json({ message: 'Ticket not found or unauthorized' });
        }

        const event = orderTicket.Ticket.Event;

        // 2. Check Logic
        if (!event.isDynamicQr) {
            // If not dynamic, return static uniqueCode
            return res.json({
                type: 'static',
                code: orderTicket.uniqueCode
            });
        }

        // 3. Time Window Check
        const now = new Date();
        const eventDate = new Date(event.date);

        // Calculate difference in minutes. eventDate > now usually.
        // If event passed? Usually we keep showing code for a bit, or locking it.
        // Assuming we show code until event ends.

        const msUntilEvent = eventDate - now;
        const minutesUntilEvent = msUntilEvent / 1000 / 60;

        // If event is more than X minutes in the future (e.g. > 120 mins)
        // And isDynamicQr is true -> LOCK IT
        if (minutesUntilEvent > event.dynamicQrWindow) {
            return res.json({
                type: 'locked',
                message: 'QR Code not yet available',
                availableInMinutes: Math.round(minutesUntilEvent - event.dynamicQrWindow)
            });
        }

        // 4. Generate Dynamic Token
        const payload = {
            tid: orderTicket.id,
            uc: orderTicket.uniqueCode,
            ts: Date.now()
        };

        // Sign with app secret. 
        // Valid for 5 minutes (300s). Frontend should refresh before this.
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });

        return res.json({
            type: 'dynamic',
            code: token,
            validFor: 300 // Tell frontend how many seconds this is valid
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
