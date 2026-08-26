const mongoose = require("mongoose");

const EmailReportLogSchema = new mongoose.Schema({
    reportType: {
        type: String,
        enum: ["daily", "weekly", "visitor_alert", "comment_alert", "submission_alert", "profile_alert", "custom"],
        required: true,
        index: true
    },
    dateKey: {
        type: String, // e.g. "2026-08-26" for daily reports, or "2026-W35" for weekly reports
        index: true
    },
    recipients: [{
        type: String
    }],
    recipientsCount: {
        type: Number,
        default: 0
    },
    success: {
        type: Boolean,
        default: true
    },
    messageId: {
        type: String,
        default: ""
    },
    error: {
        type: String,
        default: ""
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    sentAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model("EmailReportLog", EmailReportLogSchema);
