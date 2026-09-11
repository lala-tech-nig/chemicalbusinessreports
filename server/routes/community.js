const express = require("express");
const router = express.Router();
const {
    registerMember,
    loginMember,
    getCommunityMe,
    getCommunityPosts,
    getCommunityPostBySlug,
    createCommunityPost,
    toggleCommunityPostLike,
    getCommunityComments,
    createCommunityComment,
    toggleCommunityCommentLike,
    // Admin moderation
    adminGetAllCommunityPosts,
    adminGetAllCommunityComments,
    adminGetCommunityUsers,
    adminDeleteCommunityPost,
    adminFlagCommunityPost,
    adminDeleteCommunityComment,
    adminToggleSuspendUser,
    adminDeleteCommunityUser,
} = require("../controllers/communityController");
const { protect, admin } = require("../middleware/authMiddleware");

// Authentication
router.post("/auth/register", registerMember);
router.post("/auth/login", loginMember);
router.get("/auth/me", protect, getCommunityMe);

// Posts / Theses (public)
router.get("/posts", getCommunityPosts);
router.get("/posts/:slug", getCommunityPostBySlug);
router.post("/posts", protect, createCommunityPost);
router.post("/posts/:id/like", protect, toggleCommunityPostLike);

// Threaded Comments & Sub-Replies (public read, protected write)
router.get("/posts/:id/comments", getCommunityComments);
router.post("/posts/:id/comments", protect, createCommunityComment);
router.post("/comments/:id/like", protect, toggleCommunityCommentLike);

// ── Admin Moderation Routes ──────────────────────────────────────
router.get("/admin/posts", protect, admin, adminGetAllCommunityPosts);
router.get("/admin/comments", protect, admin, adminGetAllCommunityComments);
router.get("/admin/users", protect, admin, adminGetCommunityUsers);

router.delete("/admin/posts/:id", protect, admin, adminDeleteCommunityPost);
router.put("/admin/posts/:id/flag", protect, admin, adminFlagCommunityPost);
router.delete("/admin/comments/:id", protect, admin, adminDeleteCommunityComment);
router.put("/admin/users/:id/suspend", protect, admin, adminToggleSuspendUser);
router.delete("/admin/users/:id", protect, admin, adminDeleteCommunityUser);

module.exports = router;
