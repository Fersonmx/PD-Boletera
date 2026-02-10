const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Public
router.get('/slides', contentController.getHeroSlides);
router.get('/pages/:slug', contentController.getPageBySlug);

// Admin (Should add auth middleware in real app, simplified for now or rely on frontend routing guard + general api protection)
router.post('/slides', contentController.createHeroSlide);
router.put('/slides/:id', contentController.updateHeroSlide);
router.delete('/slides/:id', contentController.deleteHeroSlide);

router.get('/pages', contentController.getAuthPages);
router.post('/pages', contentController.createPage);
router.put('/pages/:id', contentController.updatePage);
router.delete('/pages/:id', contentController.deletePage);

module.exports = router;
