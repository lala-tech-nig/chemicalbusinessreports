const express = require("express");
const router = express.Router();
const { trackEvent, getSummary, getDetailed, getByIP } = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public endpoint — anyone visiting the site sends events here
router.post("/track", trackEvent);

// Admin-only endpoints
router.get("/summary", protect, admin, getSummary);
router.get("/detailed", protect, admin, getDetailed);
router.get("/ip/:ip", protect, admin, getByIP);

module.exports = router;
