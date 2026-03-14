const express = require("express");
const router = express.Router();
const { createProfile, getProfiles } = require("../controllers/executiveProfileController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public route to submit a profile
router.post("/", createProfile);

// Protected Admin route to view profiles
router.get("/", protect, admin, getProfiles);

module.exports = router;
