const mongoose = require("mongoose");

const PettyCashSchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: String, // YYYY-MM-DD
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "NGN",
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Travel & Logistics",
                "Office Supplies",
                "Meals & Refreshments",
                "Utility / Repairs",
                "Client Hosting",
                "Field Work / Research",
                "Other",
            ],
            default: "Office Supplies",
        },
        purpose: {
            type: String,
            required: true,
            trim: true,
        },
        receiptUrl: {
            type: String,
            default: "",
        },
        bankAccountDetails: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "denied", "reimbursed"],
            default: "pending",
            index: true,
        },
        adminNote: {
            type: String,
            default: "",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewedAt: {
            type: Date,
        },
        reimbursedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

PettyCashSchema.index({ staff: 1, date: -1 });

module.exports = mongoose.model("PettyCash", PettyCashSchema);
