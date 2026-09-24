const mongoose = require("mongoose");

const YouTubePostSchema = new mongoose.Schema({
    youtubeUrl: {
        type: String,
        required: true,
        trim: true,
    },
    videoId: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    narration: {
        type: String,
        default: "",
        trim: true,
    },
    thumbnail: {
        type: String,
        default: "",
        trim: true,
    },
    author: {
        type: String,
        default: "Chemical Business Reports",
        trim: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    publishedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("YouTubePost", YouTubePostSchema);
