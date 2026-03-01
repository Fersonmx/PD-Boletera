const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

router.get('/status', setupController.getSetupStatus);
router.post('/', setupController.performSetup);

module.exports = router;
