const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "moderator", "staff", "member"],
        default: "member",
    },
    department: {
        type: String,
        default: "General",
    },
    jobTitle: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    fullName: {
        type: String,
        default: "",
    },
    affiliation: {
        type: String, // e.g. University, Chemical Plant, R&D Institute
        default: "",
    },
    fieldOfStudy: {
        type: String, // e.g. Petrochemical Engineering, Cosmetic Chemistry
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    reputation: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profilePhoto: {
        type: String,
        default: ""
    },
    // Admin-controlled per-user dashboard section permissions
    // If null/empty → fall back to role-based defaults
    dashboardPermissions: {
        type: [String],
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", UserSchema);
