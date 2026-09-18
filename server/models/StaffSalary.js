const mongoose = require("mongoose");

const StaffSalarySchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        designation: {
            type: String,
            default: "Staff Member",
        },
        department: {
            type: String,
            default: "General",
        },
        baseSalary: {
            type: Number,
            required: true,
            default: 0,
        },
        currency: {
            type: String,
            default: "NGN",
        },
        bonuses: {
            type: Number,
            default: 0,
        },
        deductions: {
            type: Number,
            default: 0,
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "pending", "processing"],
            default: "pending",
        },
        lastPaidDate: {
            type: Date,
        },
        bankName: {
            type: String,
            default: "",
        },
        accountNumber: {
            type: String,
            default: "",
        },
        accountName: {
            type: String,
            default: "",
        },
        paymentHistory: [
            {
                amountPaid: { type: Number, required: true },
                monthYear: { type: String, required: true },
                paidAt: { type: Date, default: Date.now },
                reference: { type: String, default: "" },
                note: { type: String, default: "" },
            },
        ],
        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("StaffSalary", StaffSalarySchema);
