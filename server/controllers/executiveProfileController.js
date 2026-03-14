const ExecutiveProfile = require("../models/ExecutiveProfile");

// @desc    Create a new executive profile
// @route   POST /api/executive-profiles
// @access  Public
exports.createProfile = async (req, res) => {
    try {
        const profileData = req.body;
        const newProfile = new ExecutiveProfile(profileData);
        const savedProfile = await newProfile.save();
        res.status(201).json({ message: "Profile submitted successfully", profile: savedProfile });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all executive profiles
// @route   GET /api/executive-profiles
// @access  Private (Admin)
exports.getProfiles = async (req, res) => {
    try {
        const profiles = await ExecutiveProfile.find({}).sort({ createdAt: -1 });
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
