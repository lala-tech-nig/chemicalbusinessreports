const ScraperConfig = require('../models/ScraperConfig');
const scraperService = require('../services/scraperService');

// @desc    Get scraper configuration
// @route   GET /api/scraper/config
// @access  Private (Admin)
exports.getConfig = async (req, res) => {
    try {
        const config = await ScraperConfig.getConfig();
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update scraper configuration
// @route   PUT /api/scraper/config
// @access  Private (Admin)
exports.updateConfig = async (req, res) => {
    try {
        const { targetUrls, keywords } = req.body;
        const config = await ScraperConfig.getConfig();

        if (targetUrls !== undefined) config.targetUrls = targetUrls;
        if (keywords !== undefined) config.keywords = keywords;

        const updatedConfig = await config.save();
        res.status(200).json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually run scraper
// @route   POST /api/scraper/run
// @access  Private (Admin)
exports.runScraper = async (req, res) => {
    try {
        const result = await scraperService.scrapeMatches();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Scraper execution failed: " + error.message });
    }
};
