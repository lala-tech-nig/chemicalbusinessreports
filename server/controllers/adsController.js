const Ad = require("../models/Ad");

// @desc    Get all ads (for admin)
// @route   GET /api/ads/all
// @access  Private (Admin)
exports.getAllAds = async (req, res) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active ads (for frontend)
// @route   GET /api/ads
// @access  Public
exports.getActiveAds = async (req, res) => {
    try {
        const currentDate = new Date();
        // Find ads that are active and within the date range
        const ads = await Ad.find({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new ad
// @route   POST /api/ads
// @access  Private (Admin)
exports.createAd = async (req, res) => {
    try {
        const { title, image, link, type, durationDays, actionType, whatsappNumber } = req.body;

        // endDate is calculated in pre-save middleware, but we can also set it explicitly if needed

        const newAd = new Ad({
            title,
            image, // Expecting URL string from frontend (uploaded via separate endpoint or cloud service)
            link,
            type,
            durationDays,
            actionType,
            whatsappNumber,
            startDate: new Date()
        });

        const savedAd = await newAd.save();
        res.status(201).json(savedAd);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete/Expire an ad
// @route   DELETE /api/ads/:id
// @access  Private (Admin)
exports.deleteAd = async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ message: "Ad not found" });
        }

        // Option 1: Hard delete
        // await ad.remove();
        // Option 2: Soft delete (set isActive to false)
        ad.isActive = false;
        await ad.save();

        res.json({ message: "Ad removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
