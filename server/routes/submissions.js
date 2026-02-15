const express = require("express");
const router = express.Router();
const { createSubmission, getSubmissions } = require("../controllers/submissionsController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public route to create a submission
router.post("/", createSubmission);

// Protected Admin route to view submissions
router.get("/", protect, admin, getSubmissions);

module.exports = router;
