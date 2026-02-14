const Comment = require("../models/Comment");
const Post = require("../models/Post");

// @desc    Add a comment to a post
// @route   POST /api/comments
// @access  Public
exports.createComment = async (req, res) => {
    try {
        const { postId, authorName, content } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = new Comment({
            post: postId,
            authorName,
            content,
            isApproved: false // Always requires approval
        });

        const savedComment = await newComment.save();
        res.status(201).json({ message: "Comment submitted for moderation", comment: savedComment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get approved comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
exports.getApprovedComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId, isApproved: true })
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending comments (Admin/Mod)
// @route   GET /api/comments/pending
// @access  Private (Admin/Mod)
exports.getPendingComments = async (req, res) => {
    try {
        const comments = await Comment.find({ isApproved: false })
            .populate("post", "title") // Include post title for context
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a comment
// @route   PUT /api/comments/:id/approve
// @access  Private (Admin/Mod)
exports.approveComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.isApproved = true;
        await comment.save();

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Admin/Mod)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await Comment.deleteOne({ _id: req.params.id });
        res.json({ message: "Comment removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
