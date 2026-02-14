const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String, // Can store HTML or rich text
        required: true,
    },
    image: {
        type: String, // URL or path to the image
        default: "",
    },
    category: {
        type: String,
        required: true,
        enum: ["News Roundup", "Chemical Mart", "Research & Reports", "Corporate Profile", "START UP"],
    },
    author: {
        type: String,
        default: "Admin",
    },
    isStoryOfTheDay: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Post", PostSchema);
