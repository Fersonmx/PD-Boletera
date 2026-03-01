const { Event, Venue, Category, Ticket, VenueLayout, VenueSection, EventTier } = require('../models');

const { Op } = require('sequelize');

exports.getEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (req.query.categoryId) {
            whereClause.categoryId = parseInt(req.query.categoryId);
        }

        const { count, rows } = await Event.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Venue,
                    include: [{ model: VenueLayout, as: 'layouts' }] // Include layouts info
                },
                { model: Category },
                { model: Ticket },
                {
                    model: VenueLayout,
                    include: [{ model: VenueSection, as: 'sections' }]
                }
            ],
            order: req.query.sort === 'created_desc' ? [['createdAt', 'DESC']] : [['date', 'ASC']],
            limit: limit,
            offset: offset,
            distinct: true
        });

        res.json({
            events: rows,
            total: count,
            page: page,
            pages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [
                {
                    model: Venue,
                    include: [{ model: VenueLayout, as: 'layouts' }]
                },
                { model: Category },
                {
                    model: Ticket,
                    include: [{ model: VenueSection }] // Include Section info for tickets
                },
                {
                    model: VenueLayout,
                    include: [{ model: VenueSection, as: 'sections' }]
                },
                {
                    model: EventTier,
                    as: 'tiers',
                    include: [{ model: Ticket }] // Include tickets for each tier
                }
            ]
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { ticketConfigs, tiers, ...eventData } = req.body;

        if (!eventData.venueId) return res.status(400).json({ message: 'Venue ID is required' });
        if (!eventData.layoutId) return res.status(400).json({ message: 'Layout ID is required' });

        const event = await Event.create(eventData);

        // 1. Handle Tiers (if present)
        if (tiers && tiers.length > 0) {
            for (const tierData of tiers) {
                // tierData expected: { name, startDate, endDate, configs: { sectionId: { price, quantity }, ... } }
                const { configs, ...tierInfo } = tierData;

                // Fix invalid date
                const startDate = tierInfo.startDate ? new Date(tierInfo.startDate) : null;
                const endDate = tierInfo.endDate ? new Date(tierInfo.endDate) : null;

                const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : null;
                const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : null;

                const safeTierInfo = {
                    ...tierInfo,
                    startDate: validStartDate,
                    endDate: validEndDate
                };

                const tier = await EventTier.create({ ...safeTierInfo, eventId: event.id });

                if (configs) {
                    for (const [sectionId, config] of Object.entries(configs)) {
                        const section = await VenueSection.findByPk(sectionId);

                        // config might be just a number (legacy price) or object { price, quantity }
                        let price = 0;
                        let quantity = section ? section.capacity : 0;

                        if (typeof config === 'object') {
                            price = parseFloat(config.price);
                            if (config.quantity) {
                                quantity = Math.min(parseInt(config.quantity), section.capacity);
                            }
                        } else {
                            price = parseFloat(config);
                        }

                        if (section && price !== null && !isNaN(price)) {
                            await Ticket.create({
                                eventId: event.id,
                                tierId: tier.id,
                                sectionId: section.id,
                                name: `${section.name} - ${tier.name}`,
                                price: price,
                                quantity: quantity,
                                available: quantity, // Start with full allocated quantity available
                                salesStart: validStartDate,
                                salesEnd: validEndDate
                            });
                        }
                    }
                }
            }
        }
        // 2. Fallback to standard ticket configs (No Tiers)
        else if (ticketConfigs && ticketConfigs.length > 0) {
            for (const config of ticketConfigs) {
                const section = await VenueSection.findByPk(config.sectionId);
                if (section) {
                    await Ticket.create({
                        eventId: event.id,
                        sectionId: section.id,
                        name: section.name,
                        price: config.price,
                        quantity: section.capacity, // Default to full capacity
                        available: section.capacity
                    });
                }
            }
        }

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { tiers, ...eventData } = req.body;

        if (!eventData.venueId) return res.status(400).json({ message: 'Venue ID is required' });
        if (!eventData.layoutId) return res.status(400).json({ message: 'Layout ID is required' });

        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        await event.update(eventData);

        // Handle Tiers Update
        if (tiers && tiers.length > 0) {
            for (const tierData of tiers) {
                const { prices, id: tierId, ...tierInfo } = tierData;
                let tier;

                // Fix invalid date
                const startDate = tierInfo.startDate ? new Date(tierInfo.startDate) : null;
                const endDate = tierInfo.endDate ? new Date(tierInfo.endDate) : null;

                const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : null;
                const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : null;

                const safeTierInfo = {
                    ...tierInfo,
                    startDate: validStartDate,
                    endDate: validEndDate
                };

                // Update or Create Tier
                if (tierId) {
                    tier = await EventTier.findByPk(tierId);
                    if (tier) await tier.update(safeTierInfo);
                } else {
                    tier = await EventTier.create({ ...safeTierInfo, eventId: event.id });
                }

                // Handle Configs/Tickets (Upsert)
                const configs = tierData.configs || tierData.prices;

                if (configs && tier) {
                    for (const [sectionId, config] of Object.entries(configs)) {
                        let price = 0;
                        let quantity = null;

                        if (typeof config === 'object') {
                            price = parseFloat(config.price);
                            quantity = config.quantity ? parseInt(config.quantity) : null;
                        } else {
                            price = parseFloat(config);
                        }

                        // Find existing ticket for this Section + Tier
                        const existingTicket = await Ticket.findOne({
                            where: {
                                eventId: event.id,
                                tierId: tier.id,
                                sectionId: sectionId
                            }
                        });

                        if (existingTicket) {
                            const updateData = {
                                price: price,
                                salesStart: validStartDate,
                                salesEnd: validEndDate
                            };
                            if (quantity !== null) {
                                const section = await VenueSection.findByPk(sectionId);
                                const maxCap = section ? section.capacity : 99999;
                                const finalQty = Math.min(quantity, maxCap);

                                const sold = existingTicket.quantity - existingTicket.available;
                                updateData.quantity = finalQty;
                                updateData.available = Math.max(0, finalQty - sold);
                            }
                            await existingTicket.update(updateData);
                        } else {
                            const section = await VenueSection.findByPk(sectionId);
                            const finalQty = (quantity !== null && section) ? Math.min(quantity, section.capacity) : (section ? section.capacity : 0);

                            if (section && price !== null && !isNaN(price)) {
                                await Ticket.create({
                                    eventId: event.id,
                                    tierId: tier.id,
                                    sectionId: section.id,
                                    name: `${section.name} - ${tier.name}`,
                                    price: price,
                                    quantity: finalQty,
                                    available: finalQty,
                                    salesStart: validStartDate,
                                    salesEnd: validEndDate
                                });
                            }
                        }
                    }
                }
            }
        }
        // Fallback to standard ticket configs (No Tiers) update
        else if (req.body.ticketConfigs && req.body.ticketConfigs.length > 0) {
            for (const config of req.body.ticketConfigs) {
                const existingTicket = await Ticket.findOne({
                    where: {
                        eventId: event.id,
                        tierId: null,
                        sectionId: config.sectionId
                    }
                });

                if (existingTicket) {
                    await existingTicket.update({ price: config.price });
                } else {
                    const section = await VenueSection.findByPk(config.sectionId);
                    if (section) {
                        await Ticket.create({
                            eventId: event.id,
                            sectionId: section.id,
                            name: section.name,
                            price: config.price,
                            quantity: section.capacity, // Default to full capacity
                            available: section.capacity
                        });
                    }
                }
            }
        }

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findByPk(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if there are any sold tickets
        const tickets = await Ticket.findAll({ where: { eventId } });
        const hasSoldTickets = tickets.some(t => t.quantity > t.available);

        if (hasSoldTickets) {
            return res.status(400).json({
                message: 'Cannot delete event. There are tickets already sold for this event.'
            });
        }

        // If safe to delete, destroy dependencies manually since cascade might not be configured
        await Ticket.destroy({ where: { eventId } });

        if (typeof EventTier !== 'undefined') {
            await EventTier.destroy({ where: { eventId } });
        }

        // Also remove from hero slides if applicable
        const { HeroSlide } = require('../models');
        if (HeroSlide) {
            await HeroSlide.destroy({ where: { eventId } });
        }

        await event.destroy();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
