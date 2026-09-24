const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { sendNewCommentNotification } = require("../services/emailReportService");

// Helper to recursively delete a comment and all its nested descendant replies
async function deleteCommentAndDescendants(commentId) {
    const children = await Comment.find({ parentId: commentId }, "_id");
    for (const child of children) {
        await deleteCommentAndDescendants(child._id);
    }
    await Comment.deleteOne({ _id: commentId });
}

// @desc    Add a comment or reply to a post
// @route   POST /api/comments
// @access  Public
exports.createComment = async (req, res) => {
    try {
        const { postId, authorName, content, authorEmail, authorPhone, parentId, replyToAuthor } = req.body;

        if (!authorName || !authorName.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        let depth = 0;
        let resolvedReplyToAuthor = replyToAuthor ? replyToAuthor.trim() : "";

        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (parentComment) {
                depth = (parentComment.depth || 0) + 1;
                if (!resolvedReplyToAuthor) {
                    resolvedReplyToAuthor = parentComment.authorName || "";
                }
            }
        }

        const newComment = new Comment({
            post: postId,
            parentId: parentId || null,
            replyToAuthor: resolvedReplyToAuthor,
            depth,
            authorName: authorName.trim(),
            authorEmail: (authorEmail || "").trim(),
            authorPhone: (authorPhone || "").trim(),
            content: content.trim(),
            isApproved: false // Always requires moderation
        });

        const savedComment = await newComment.save();

        // Dispatch email notification asynchronously
        sendNewCommentNotification({
            authorName: savedComment.authorName,
            authorEmail: savedComment.authorEmail,
            authorPhone: savedComment.authorPhone,
            content: savedComment.content,
            postTitle: post.title,
            postId,
            isReply: !!parentId,
            replyToAuthor: resolvedReplyToAuthor
        }).catch(err => console.error("Comment notification error:", err));

        res.status(201).json({
            message: parentId ? "Reply submitted for moderation" : "Comment submitted for moderation",
            comment: savedComment
        });
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
            .sort({ createdAt: 1 });
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
            .populate("post", "title")
            .populate("parentId", "authorName content")
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

// @desc    Delete a comment and its chained replies
// @route   DELETE /api/comments/:id
// @access  Private (Admin/Mod)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await deleteCommentAndDescendants(req.params.id);
        res.json({ message: "Comment and any replies removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
