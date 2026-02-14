const express = require("express");
const router = express.Router();
const { getAllAds, getActiveAds, createAd, deleteAd } = require("../controllers/adsController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getActiveAds);
router.get("/all", protect, admin, getAllAds);
router.post("/", protect, admin, createAd);
router.delete("/:id", protect, admin, deleteAd);

module.exports = router;
