const express = require("express");
const router = express.Router();
const { getPosts, getPostBySlug, createPost, deletePost, setStoryOfTheDay, updatePost, getPostById } = require("../controllers/postsController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getPosts);
router.get("/id/:id", getPostById);
router.get("/:slug", getPostBySlug);
router.post("/", protect, admin, createPost);
router.put("/:id", protect, admin, updatePost);
router.delete("/:id", protect, admin, deletePost);
router.put("/story/:id", protect, admin, setStoryOfTheDay);

module.exports = router;
