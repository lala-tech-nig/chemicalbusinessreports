const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const StaffTask = require("./models/StaffTask");
const PettyCash = require("./models/PettyCash");
const StaffSalary = require("./models/StaffSalary");
const BankAccount = require("./models/BankAccount");
const FinancialTransaction = require("./models/FinancialTransaction");

async function runTests() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✓ Connected to MongoDB");

        // 1. Find or create a test user
        let testUser = await User.findOne();
        if (!testUser) {
            console.log("No user found, creating test staff user...");
            testUser = await User.create({
                username: "teststaff",
                email: "teststaff@chemicalbusinessreports.com",
                password: "hashedpassword123",
                role: "staff",
                department: "Editorial & Research",
            });
        }
        console.log(`✓ Using test user: ${testUser.username} (${testUser.role})`);

        const todayStr = new Date().toISOString().split("T")[0];

        // 2. Test Staff Task (Draft & Kanban)
        console.log("\n--- Testing Staff Task & Draft Creation ---");
        const draftTask = await StaffTask.create({
            user: testUser._id,
            title: "Draft: Research Petrochemical Exports in West Africa",
            description: "Compiling tariff tables and port data",
            date: todayStr,
            status: "draft",
            isDraft: true,
            isPrivate: true,
            priority: "high",
        });
        console.log("✓ Created draft task:", draftTask.title, "ID:", draftTask._id);

        // Publish draft
        draftTask.isDraft = false;
        draftTask.status = "todo";
        await draftTask.save();
        console.log("✓ Published draft to Kanban (status: todo)");

        // Status transition to in_progress then completed
        draftTask.status = "in_progress";
        await draftTask.save();
        console.log("✓ Updated status to in_progress");

        draftTask.status = "completed";
        draftTask.completedAt = new Date();
        await draftTask.save();
        console.log("✓ Updated status to completed with completedAt");

        // Add a comment
        draftTask.comments.push({
            user: testUser._id,
            text: "Initial report draft uploaded to shared drive.",
            createdAt: new Date(),
        });
        await draftTask.save();
        console.log("✓ Added comment to task (total comments: " + draftTask.comments.length + ")");

        // 3. Test Petty Cash Claim Flow
        console.log("\n--- Testing Petty Cash Claim ---");
        const claim = await PettyCash.create({
            staff: testUser._id,
            date: todayStr,
            amount: 7500,
            category: "Office Supplies",
            purpose: "Purchased lab stationery and high-grade printing paper",
            bankAccountDetails: "Zenith Bank - 2018839102 - " + testUser.username,
            status: "pending",
        });
        console.log("✓ Created petty cash claim: ₦" + claim.amount + " (" + claim.status + ")");

        // Admin Review (Approve)
        claim.status = "approved";
        claim.adminNote = "Approved for prompt reimbursement";
        claim.reviewedBy = testUser._id;
        claim.reviewedAt = new Date();
        await claim.save();
        console.log("✓ Approved petty cash claim");

        // 4. Test Bank Account & Financial Transaction (Debit synchronization)
        console.log("\n--- Testing Financial Ledger & Bank Account ---");
        let bank = await BankAccount.findOne();
        if (!bank) {
            bank = await BankAccount.create({
                accountName: "Chemical Business Reports Operations",
                bankName: "Zenith Bank Plc",
                accountNumber: "1019283746",
                balance: 500000,
                isDefault: true,
            });
        }
        console.log("✓ Bank account:", bank.bankName, "Balance: ₦" + bank.balance);

        // Disburse Reimbursement & Auto-Record Debit
        claim.status = "reimbursed";
        claim.reimbursedAt = new Date();
        await claim.save();

        bank.balance -= claim.amount;
        await bank.save();

        const tx = await FinancialTransaction.create({
            type: "debit",
            amount: claim.amount,
            category: "Petty Cash Reimbursement",
            description: "Reimbursement to " + testUser.username + ": " + claim.purpose,
            date: todayStr,
            bankAccount: bank._id,
            reference: "PC-REIMB-TEST-001",
            pettyCashRef: claim._id,
            createdBy: testUser._id,
        });
        console.log("✓ Recorded debit transaction: ₦" + tx.amount + " in category: " + tx.category);
        console.log("✓ Updated bank balance: ₦" + bank.balance);

        // 5. Test Staff Salary
        console.log("\n--- Testing Staff Salary Management ---");
        const salary = await StaffSalary.findOneAndUpdate(
            { staff: testUser._id },
            {
                $set: {
                    designation: "Senior Chemical Industry Analyst",
                    department: "Research & Market Intelligence",
                    baseSalary: 250000,
                    bonuses: 25000,
                    deductions: 5000,
                    paymentStatus: "paid",
                    bankName: "Zenith Bank",
                    accountNumber: "2018839102",
                    accountName: testUser.username,
                },
            },
            { upsert: true, new: true }
        );
        console.log("✓ Updated salary package for " + testUser.username + ": Base ₦" + salary.baseSalary);

        // Clean up test tasks and claims created in this run to keep DB clean
        await StaffTask.findByIdAndDelete(draftTask._id);
        await PettyCash.findByIdAndDelete(claim._id);
        await FinancialTransaction.findByIdAndDelete(tx._id);
        console.log("✓ Cleaned up temporary test records");

        console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exit(1);
    }
}

runTests();
