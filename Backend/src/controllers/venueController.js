const { Venue, VenueSection, VenueLayout } = require('../models');

exports.getVenues = async (req, res) => {
    try {
        const venues = await Venue.findAll({
            include: [
                {
                    model: VenueLayout,
                    as: 'layouts',
                    include: [{ model: VenueSection, as: 'sections' }]
                }
            ]
        });
        res.json(venues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id, {
            include: [
                {
                    model: VenueLayout,
                    as: 'layouts',
                    include: [{ model: VenueSection, as: 'sections' }]
                }
            ]
        });
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        res.json(venue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createVenue = async (req, res) => {
    try {
        const { name, address, city, capacity, layouts } = req.body;

        const venue = await Venue.create({ name, address, city, capacity });

        if (layouts && layouts.length > 0) {
            for (const layout of layouts) {
                const newLayout = await VenueLayout.create({
                    venueId: venue.id,
                    name: layout.name,
                    imageUrl: layout.imageUrl
                });

                if (layout.sections && layout.sections.length > 0) {
                    const sectionData = layout.sections.map(s => ({ ...s, layoutId: newLayout.id }));
                    await VenueSection.bulkCreate(sectionData);
                }
            }
        }

        // Fetch again to return full object
        const createdVenue = await Venue.findByPk(venue.id, {
            include: [
                {
                    model: VenueLayout,
                    as: 'layouts',
                    include: [{ model: VenueSection, as: 'sections' }]
                }
            ]
        });

        res.status(201).json(createdVenue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateVenue = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        await venue.update(req.body);

        // Handle Layouts Update
        // MVP Strategy: If 'layouts' is passed, we check if they have IDs to update or no IDs to create.
        // Complex nested update:
        // 1. Delete layouts not present? (Optional)
        // 2. iterate layouts.

        if (req.body.layouts) {
            // For MVP simplicity: If we are sending layouts, we might just be adding new ones or updating names.
            // Let's implement a "Replace All" logic if desired, OR a "Upsert" logic.
            // Given the complexity, let's just create new ones if they don't have ID, and update if they do.

            for (const layoutData of req.body.layouts) {
                let layout;
                if (layoutData.id) {
                    layout = await VenueLayout.findByPk(layoutData.id);
                    if (layout) {
                        await layout.update({ name: layoutData.name, imageUrl: layoutData.imageUrl });
                    }
                } else {
                    layout = await VenueLayout.create({
                        venueId: venue.id,
                        name: layoutData.name,
                        imageUrl: layoutData.imageUrl
                    });
                }

                // Handle Sections for this layout
                // Handle Sections for this layout
                if (layout && layoutData.sections) {
                    const existingSections = await VenueSection.findAll({ where: { layoutId: layout.id } });
                    const existingIds = existingSections.map(s => s.id);

                    const incomingIds = layoutData.sections.filter(s => s.id).map(s => s.id);
                    const sectionsToCreate = layoutData.sections.filter(s => !s.id);

                    // Update existing
                    for (const section of layoutData.sections) {
                        if (section.id && existingIds.includes(section.id)) {
                            await VenueSection.update({
                                name: section.name,
                                capacity: section.capacity,
                                visualData: section.visualData
                            }, { where: { id: section.id } });
                        }
                    }

                    // Create new
                    if (sectionsToCreate.length > 0) {
                        const createData = sectionsToCreate.map(s => ({ ...s, layoutId: layout.id }));
                        await VenueSection.bulkCreate(createData);
                    }

                    // Delete removed
                    const sectionsToDelete = existingIds.filter(id => !incomingIds.includes(id));
                    if (sectionsToDelete.length > 0) {
                        try {
                            await VenueSection.destroy({ where: { id: sectionsToDelete } });
                        } catch (err) {
                            console.warn("Could not delete some sections (likely linked to tickets):", sectionsToDelete);
                        }
                    }
                }
            }
        }

        const updatedVenue = await Venue.findByPk(venue.id, {
            include: [
                {
                    model: VenueLayout,
                    as: 'layouts',
                    include: [{ model: VenueSection, as: 'sections' }]
                }
            ]
        });

        res.json(updatedVenue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteVenue = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        await venue.destroy();
        res.json({ message: 'Venue deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
