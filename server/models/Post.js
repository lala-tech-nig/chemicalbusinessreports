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
    // Dynamic Fields for specific categories
    companyName: { type: String },
    productName: { type: String },
    contactNumber: { type: String },
    researchTopic: { type: String },
    video: { type: String }, // URL or path to video
    ceoDetails: { type: String },
    companyServices: { type: String },
    earlyBeginning: { type: String },
    fails: { type: String },
    success: { type: String },
    awards: { type: String },
    topic: { type: String }, // For Startup type
});

module.exports = mongoose.model("Post", PostSchema);
