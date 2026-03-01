const { HeroSlide, Page, Event } = require('../models');

// --- Hero Slides ---
exports.getHeroSlides = async (req, res) => {
    try {
        const slides = await HeroSlide.findAll({
            where: { isActive: true },
            order: [['order', 'ASC']],
            include: [{ model: Event, as: 'event', attributes: ['id', 'title', 'date', 'imageUrl', 'description'] }]
        });
        res.json(slides);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createHeroSlide = async (req, res) => {
    try {
        const slide = await HeroSlide.create(req.body);
        res.status(201).json(slide);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        await HeroSlide.update(req.body, { where: { id } });
        res.json({ message: 'Updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        await HeroSlide.destroy({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Pages ---
exports.getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const lang = req.query.lang || 'es';
        console.log(`[ContentController] Fetching page: ${slug}, lang: ${lang}`); // DEBUG

        let page = await Page.findOne({ where: { slug, language: lang, isActive: true } });

        // Fallback: if not found in requested lang, try default 'es'
        if (!page && lang !== 'es') {
            page = await Page.findOne({ where: { slug, language: 'es', isActive: true } });
        }

        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAuthPages = async (req, res) => {
    try {
        const pages = await Page.findAll();
        res.json(pages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.createPage = async (req, res) => {
    try {
        const page = await Page.create(req.body);
        res.status(201).json(page);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        await Page.update(req.body, { where: { id } });
        res.json({ message: 'Updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        await Page.destroy({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
