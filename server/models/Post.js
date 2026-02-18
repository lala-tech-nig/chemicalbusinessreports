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
        enum: ["News Roundup", "Chemical Mart", "Research & Reports", "Corporate Profile", "START UP", "Services", "Executive Brief"],
    },
    // Chemical Mart specific fields
    subcategory: {
        type: String,
        enum: ["Cosmetics", "Pharmaceutical", "Industrial Chemicals", "Laboratory Equipment", "Others", ""],
    },
    adSize: {
        type: String,
        enum: ["1x1", "2x2", "1x2", "2x1", "3x1", "1x3", ""],
    },
    adDuration: {
        type: Number, // Duration in days
        min: 1,
    },
    expiryDate: {
        type: Date,
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
    excerptColor: { type: String, default: '#FFFF00' },
    website: { type: String, default: '' },
    email: { type: String, default: '' },
});

// Middleware to calculate expiryDate for Chemical Mart posts
PostSchema.pre("save", function (next) {
    if (this.category === "Chemical Mart" && this.adDuration) {
        if (this.isNew || this.isModified("adDuration") || this.isModified("createdAt")) {
            const start = this.createdAt || new Date();
            const expiry = new Date(start);
            expiry.setDate(start.getDate() + this.adDuration);
            this.expiryDate = expiry;
        }
    }
    next();
});

module.exports = mongoose.model("Post", PostSchema);
