const mongoose = require("mongoose");

const StaffTaskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        date: {
            type: String, // YYYY-MM-DD format for fast indexing and daily querying
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["draft", "todo", "in_progress", "admin_support_needed", "completed"],
            default: "todo",
            index: true,
        },
        isDraft: {
            type: Boolean,
            default: false,
            index: true,
        },
        isPrivate: {
            type: Boolean,
            default: false,
            index: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        referencedTasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "StaffTask",
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        completedAt: {
            type: Date,
        },
        adminSupportNote: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for query performance
StaffTaskSchema.index({ date: 1, user: 1 });
StaffTaskSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("StaffTask", StaffTaskSchema);
