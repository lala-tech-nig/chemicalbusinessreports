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
        required: true
    },
    userAgent: {
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
        default: Date.now
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
});

// Compound index for fast upsert lookups
VisitorLogSchema.index({ ip: 1, sessionId: 1 });

module.exports = mongoose.model("VisitorLog", VisitorLogSchema);
