const mongoose = require("mongoose");

const MarqueeItemSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
    link: {
        type: String,
        default: "",
        trim: true,
    },
    badge: {
        type: String,
        default: "",
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const MarqueeSchema = new mongoose.Schema({
    isEnabled: {
        type: Boolean,
        default: true,
    },
    label: {
        type: String,
        default: "BREAKING NEWS",
        trim: true,
    },
    labelBg: {
        type: String,
        default: "red", // red, blue, amber, emerald, purple
    },
    theme: {
        type: String,
        default: "dark", // dark, blue, slate, light
    },
    speed: {
        type: Number,
        default: 35, // duration in seconds
        min: 10,
        max: 120,
    },
    pauseOnHover: {
        type: Boolean,
        default: true,
    },
    includeLatestPosts: {
        type: Boolean,
        default: true,
    },
    items: [MarqueeItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Marquee", MarqueeSchema);
