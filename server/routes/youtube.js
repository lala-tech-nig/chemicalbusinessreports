const express = require("express");
const router = express.Router();
const {
    getVideos,
    getVideoById,
    getVideoInfo,
    createVideo,
    updateVideo,
    deleteVideo
} = require("../controllers/youtubeController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/info", getVideoInfo);
router.get("/", getVideos);
router.get("/:id", getVideoById);

// Protected routes (Admin / Moderator)
router.post("/", protect, createVideo);
router.put("/:id", protect, updateVideo);
router.delete("/:id", protect, deleteVideo);

module.exports = router;
