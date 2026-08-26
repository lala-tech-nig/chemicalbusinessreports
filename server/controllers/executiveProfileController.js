const ExecutiveProfile = require("../models/ExecutiveProfile");
const { sendNewExecutiveProfileNotification } = require("../services/emailReportService");

// @desc    Create a new executive profile
// @route   POST /api/executive-profiles
// @access  Public
exports.createProfile = async (req, res) => {
    try {
        const profileData = req.body;
        const newProfile = new ExecutiveProfile(profileData);
        const savedProfile = await newProfile.save();

        // Dispatch email notification asynchronously
        sendNewExecutiveProfileNotification({
            fullName: profileData.fullName || profileData.name || "Executive",
            company: profileData.company || "",
            email: profileData.email || "",
            position: profileData.position || profileData.role || ""
        }).catch(err => console.error("Executive profile alert error:", err));

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
