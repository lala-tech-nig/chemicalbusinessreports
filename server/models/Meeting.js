const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: "Weekly Staff Meeting",
            trim: true,
        },
        // Unique Jitsi room identifier — e.g. "CBR-Staff-Meeting-2024-09-19"
        roomName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        jitsiRoomUrl: {
            type: String,
            default: "",
        },
        scheduledAt: {
            type: Date,
            required: true,
        },
        endAt: {
            type: Date, // expected end time (1 hour after start)
        },
        status: {
            type: String,
            enum: ["scheduled", "active", "ended", "cancelled"],
            default: "scheduled",
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        agenda: {
            type: String,
            default: "",
        },
        notes: {
            type: String,
            default: "",
        },
        // Recording submitted by admin after meeting
        recordingUrl: {
            type: String,
            default: "",
        },
        recordingEmailSent: {
            type: Boolean,
            default: false,
        },
        // Whether the 1-day-before reminder was sent
        reminderSent: {
            type: Boolean,
            default: false,
        },
        // Staff who joined the room
        participants: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                joinedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

MeetingSchema.index({ scheduledAt: -1 });
MeetingSchema.index({ status: 1 });

module.exports = mongoose.model("Meeting", MeetingSchema);
