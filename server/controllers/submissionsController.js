const Submission = require("../models/Submission");

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Public
exports.createSubmission = async (req, res) => {
    try {
        const { name, email, company } = req.body;

        // Check if email already exists (optional, but good to prevent spam)
        const existing = await Submission.findOne({ email });
        if (existing) {
            return res.status(200).json({ message: "You have already subscribed!", submission: existing });
        }

        const newSubmission = new Submission({
            name,
            email,
            company
        });

        const savedSubmission = await newSubmission.save();
        res.status(201).json({ message: "Subscription successful", submission: savedSubmission });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private (Admin)
exports.getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({}).sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
