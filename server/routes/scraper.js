const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, runScraper } = require('../controllers/scraperController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/config', protect, admin, getConfig);
router.put('/config', protect, admin, updateConfig);
router.post('/run', protect, admin, runScraper);

module.exports = router;
