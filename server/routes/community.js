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
} = require("../controllers/communityController");
const { protect } = require("../middleware/authMiddleware");

// Authentication
router.post("/auth/register", registerMember);
router.post("/auth/login", loginMember);
router.get("/auth/me", protect, getCommunityMe);

// Posts / Theses
router.get("/posts", getCommunityPosts);
router.get("/posts/:slug", getCommunityPostBySlug);
router.post("/posts", protect, createCommunityPost);
router.post("/posts/:id/like", protect, toggleCommunityPostLike);

// Threaded Comments & Sub-Replies
router.get("/posts/:id/comments", getCommunityComments);
router.post("/posts/:id/comments", protect, createCommunityComment);
router.post("/comments/:id/like", protect, toggleCommunityCommentLike);

module.exports = router;
