const express = require("express");
const router = express.Router();
const {
    getStaffTasks,
    createStaffTask,
    updateTaskStatus,
    publishDraft,
    updateStaffTask,
    deleteStaffTask,
    addComment,
    getLeaderboard,
    getStaffInfographics,
} = require("../controllers/staffTaskController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/leaderboard", getLeaderboard);
router.get("/infographics", getStaffInfographics);

router.route("/").get(getStaffTasks).post(createStaffTask);

router.route("/:id").put(updateStaffTask).delete(deleteStaffTask);

router.put("/:id/status", updateTaskStatus);
router.put("/:id/publish", publishDraft);
router.post("/:id/comments", addComment);

module.exports = router;
