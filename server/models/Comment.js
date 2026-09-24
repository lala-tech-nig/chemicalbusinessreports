const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
        index: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
        index: true,
    },
    replyToAuthor: {
        type: String,
        trim: true,
        default: "",
    },
    depth: {
        type: Number,
        default: 0,
    },
    authorName: {
        type: String,
        required: true,
        trim: true,
    },
    authorEmail: {
        type: String,
        trim: true,
        default: "",
    },
    authorPhone: {
        type: String,
        trim: true,
        default: "",
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    isApproved: {
        type: Boolean,
        default: false, // Requires moderation
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Comment", CommentSchema);
