const express = require("express");
const router = express.Router();
const {
    createComment,
    getApprovedComments,
    getPendingComments,
    getAllComments,
    approveComment,
    deleteComment
} = require("../controllers/commentsController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/", createComment);
router.get("/post/:postId", getApprovedComments);

// Protected (Admin/Mod)
router.get("/pending", protect, getPendingComments);
router.get("/all", protect, getAllComments);
router.put("/:id/approve", protect, approveComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
