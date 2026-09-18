const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema(
    {
        accountName: {
            type: String,
            required: true,
            trim: true,
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
        },
        currency: {
            type: String,
            default: "NGN",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("BankAccount", BankAccountSchema);
