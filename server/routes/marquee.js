const express = require("express");
const router = express.Router();
const { getMarqueeSettings, updateMarqueeSettings } = require("../controllers/marqueeController");
const { protect, moderatorOrAdmin } = require("../middleware/authMiddleware");

// Public route to get active marquee configuration & announcements
router.get("/", getMarqueeSettings);

// Admin route to update marquee settings
router.put("/", protect, moderatorOrAdmin, updateMarqueeSettings);

module.exports = router;
