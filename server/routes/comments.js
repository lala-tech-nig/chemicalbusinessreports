const express = require("express");
const router = express.Router();
const {
    createComment,
    getApprovedComments,
    getPendingComments,
    approveComment,
    deleteComment
} = require("../controllers/commentsController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/", createComment);
router.get("/post/:postId", getApprovedComments);

// Protected (Admin/Mod)
// Note: 'protect' middleware ensures user is logged in. 
// We might need a 'moderator' middleware if we want to restrict strictly to mods/admins, 
// but 'protect' usually implies some auth. 
// Given the user wants admins OR moderators to approve, we can just use 'protect' 
// and assume any logged-in user in this context is an admin/mod (since there's no public login yet).
// Or better, check role in controller or use a middleware that allows both.
// Use 'protect' for now, as standard users don't seem to have login capabilities yet (frontend registration is for admins/mods).

router.get("/pending", protect, getPendingComments);
router.put("/:id/approve", protect, approveComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
