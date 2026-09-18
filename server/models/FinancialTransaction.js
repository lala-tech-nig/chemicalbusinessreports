const mongoose = require("mongoose");

const FinancialTransactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["credit", "debit"],
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
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        date: {
            type: String, // YYYY-MM-DD
            required: true,
            index: true,
        },
        bankAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BankAccount",
        },
        bankAccountName: {
            type: String,
            default: "Main Account",
        },
        reference: {
            type: String,
            default: "",
        },
        pettyCashRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PettyCash",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

FinancialTransactionSchema.index({ date: -1, type: 1 });

module.exports = mongoose.model("FinancialTransaction", FinancialTransactionSchema);
