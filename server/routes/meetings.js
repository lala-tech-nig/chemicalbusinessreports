const express = require("express");
const router = express.Router();
const {
    createMeeting,
    getMeetings,
    getMeeting,
    getNextMeeting,
    updateMeeting,
    deleteMeeting,
} = require("../controllers/meetingController");
const { protect, admin } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Get next/upcoming meeting (staff & admin)
router.get("/next", getNextMeeting);

// List all meetings
router.get("/", getMeetings);

// Get single meeting
router.get("/:id", getMeeting);

// Admin only: create, update, delete
router.post("/", admin, createMeeting);
router.put("/:id", admin, updateMeeting);
router.delete("/:id", admin, deleteMeeting);

module.exports = router;
