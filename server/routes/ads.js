const express = require("express");
const router = express.Router();
const { getAllAds, getActiveAds, createAd, deleteAd, triggerExpiryCheck } = require("../controllers/adsController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getActiveAds);
router.get("/all", protect, admin, getAllAds);
router.post("/", protect, admin, createAd);
router.post("/check-expiry-reminders", protect, admin, triggerExpiryCheck);
router.delete("/:id", protect, admin, deleteAd);

module.exports = router;
