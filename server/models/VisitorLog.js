const mongoose = require("mongoose");

const PageVisitSchema = new mongoose.Schema({
    path: { type: String },
    visitedAt: { type: Date, default: Date.now }
}, { _id: false });

const ButtonClickSchema = new mongoose.Schema({
    label: { type: String },
    path: { type: String },
    clickedAt: { type: Date, default: Date.now }
}, { _id: false });

const PostInteractionSchema = new mongoose.Schema({
    postSlug: { type: String },
    postTitle: { type: String },
    action: { type: String, enum: ["view", "comment", "share", "click"], default: "view" },
    at: { type: Date, default: Date.now }
}, { _id: false });

const VisitorLogSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userAgent: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: "Unknown"
    },
    city: {
        type: String,
        default: ""
    },
    device: {
        type: String,
        default: "Desktop"
    },
    browser: {
        type: String,
        default: ""
    },
    os: {
        type: String,
        default: ""
    },
    pages: [PageVisitSchema],
    buttons: [ButtonClickSchema],
    postsInteracted: [PostInteractionSchema],
    totalVisits: {
        type: Number,
        default: 1
    },
    totalTimeSpentSeconds: {
        type: Number,
        default: 0
    },
    firstSeen: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastSeen: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for fast upsert lookups and date sorting
VisitorLogSchema.index({ ip: 1, sessionId: 1 });
VisitorLogSchema.index({ lastSeen: -1 });
VisitorLogSchema.index({ firstSeen: -1 });
VisitorLogSchema.index({ "pages.visitedAt": -1 });

module.exports = mongoose.model("VisitorLog", VisitorLogSchema);

