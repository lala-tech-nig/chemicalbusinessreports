const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        default: "#",
    },
    actionType: {
        type: String,
        enum: ["link", "whatsapp"],
        default: "link"
    },
    whatsappNumber: {
        type: String, // Store as string to preserve leading zeros or +
        trim: true
    },
    type: {
        type: String,
        enum: ["popup", "card"],
        default: "card",
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    durationDays: {
        type: Number,
        required: true,
        min: 1,
    },
    endDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to calculate endDate based on startDate + durationDays
AdSchema.pre("save", function (next) {
    if (this.isModified("startDate") || this.isModified("durationDays")) {
        const start = new Date(this.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + this.durationDays);
        this.endDate = end;
    }
    next();
});

module.exports = mongoose.model("Ad", AdSchema);
