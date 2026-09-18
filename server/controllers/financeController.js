const FinancialTransaction = require("../models/FinancialTransaction");
const BankAccount = require("../models/BankAccount");
const StaffSalary = require("../models/StaffSalary");
const User = require("../models/User");
const PettyCash = require("../models/PettyCash");

// Helper to get today's date in YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split("T")[0];

// @desc    Get Financial Overview & Cashflow Analytics
// @route   GET /api/finances/overview
// @access  Private (Admin only)
exports.getFinanceOverview = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString()
            .split("T")[0];
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];

        // 1. Bank Balances
        const bankAccounts = await BankAccount.find().sort({ isDefault: -1, createdAt: 1 });
        const totalBankBalance = bankAccounts.reduce((acc, b) => acc + (b.balance || 0), 0);

        // 2. All Transactions
        const allTransactions = await FinancialTransaction.find().sort({ date: -1 });

        // Totals All-Time
        const totalInflows = allTransactions
            .filter((t) => t.type === "credit")
            .reduce((acc, t) => acc + t.amount, 0);
        const totalOutflows = allTransactions
            .filter((t) => t.type === "debit")
            .reduce((acc, t) => acc + t.amount, 0);
        const netCashflow = totalInflows - totalOutflows;

        // This Month Totals
        const monthTransactions = allTransactions.filter(
            (t) => t.date >= startOfMonth && t.date <= endOfMonth
        );
        const monthInflows = monthTransactions
            .filter((t) => t.type === "credit")
            .reduce((acc, t) => acc + t.amount, 0);
        const monthOutflows = monthTransactions
            .filter((t) => t.type === "debit")
            .reduce((acc, t) => acc + t.amount, 0);
        const monthNet = monthInflows - monthOutflows;

        // 3. Category Breakdown (Expenses/Debits this month)
        const expenseCategoryMap = {};
        monthTransactions
            .filter((t) => t.type === "debit")
            .forEach((t) => {
                expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount;
            });
        const expenseBreakdown = Object.keys(expenseCategoryMap).map((cat) => ({
            category: cat,
            amount: expenseCategoryMap[cat],
            percentage: monthOutflows > 0 ? Math.round((expenseCategoryMap[cat] / monthOutflows) * 100) : 0,
        }));

        // 4. Pending Petty Cash
        const pendingPettyCash = await PettyCash.aggregate([
            { $match: { status: "pending" } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]);
        const pendingReimbursementsAmount = pendingPettyCash[0]?.total || 0;
        const pendingReimbursementsCount = pendingPettyCash[0]?.count || 0;

        // 5. Total Monthly Salary Commitment
        const salaries = await StaffSalary.find();
        const totalMonthlySalaryLiability = salaries.reduce((acc, s) => {
            const net = (s.baseSalary || 0) + (s.bonuses || 0) - (s.deductions || 0);
            return acc + (net > 0 ? net : 0);
        }, 0);

        // 6. Last 6 Months Cashflow Trend
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
            const monthLabel = d.toLocaleString("default", { month: "short", year: "2-digit" });

            const txs = allTransactions.filter((t) => t.date >= mStart && t.date <= mEnd);
            const credits = txs.filter((t) => t.type === "credit").reduce((acc, t) => acc + t.amount, 0);
            const debits = txs.filter((t) => t.type === "debit").reduce((acc, t) => acc + t.amount, 0);

            monthlyTrend.push({
                month: monthLabel,
                inflows: credits,
                outflows: debits,
                net: credits - debits,
            });
        }

        res.status(200).json({
            bankAccounts,
            totalBankBalance,
            allTime: {
                totalInflows,
                totalOutflows,
                netCashflow,
            },
            thisMonth: {
                inflows: monthInflows,
                outflows: monthOutflows,
                net: monthNet,
            },
            expenseBreakdown,
            pendingReimbursements: {
                amount: pendingReimbursementsAmount,
                count: pendingReimbursementsCount,
            },
            salaryLiability: totalMonthlySalaryLiability,
            monthlyTrend,
            recentTransactions: allTransactions.slice(0, 10),
        });
    } catch (error) {
        console.error("Error fetching finance overview:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Financial Transactions
// @route   GET /api/finances/transactions
// @access  Private (Admin only)
exports.getTransactions = async (req, res) => {
    try {
        const { type, category, startDate, endDate, bankAccount, search } = req.query;
        const query = {};

        if (type && type !== "all") query.type = type;
        if (category && category !== "all") query.category = category;
        if (bankAccount && bankAccount !== "all") query.bankAccount = bankAccount;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        if (search) {
            query.$or = [
                { description: { $regex: search, $options: "i" } },
                { reference: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }

        const transactions = await FinancialTransaction.find(query)
            .populate("bankAccount", "bankName accountName accountNumber")
            .populate("createdBy", "username fullName")
            .populate("pettyCashRef", "purpose amount status")
            .sort({ date: -1, createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new Financial Transaction (Credit/Inflow or Debit/Outflow)
// @route   POST /api/finances/transactions
// @access  Private (Admin only)
exports.createTransaction = async (req, res) => {
    try {
        const { type, amount, category, description, date, bankAccountId, reference } = req.body;

        if (!type || !["credit", "debit"].includes(type)) {
            return res.status(400).json({ message: "Type must be credit or debit" });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Valid positive amount required" });
        }
        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }

        let targetAccount = null;
        if (bankAccountId) {
            targetAccount = await BankAccount.findById(bankAccountId);
            if (targetAccount) {
                if (type === "credit") {
                    targetAccount.balance += Number(amount);
                } else {
                    targetAccount.balance -= Number(amount);
                }
                await targetAccount.save();
            }
        }

        const transaction = await FinancialTransaction.create({
            type,
            amount: Number(amount),
            category,
            description: description || "",
            date: date || getTodayStr(),
            bankAccount: targetAccount ? targetAccount._id : null,
            bankAccountName: targetAccount
                ? `${targetAccount.bankName} - ${targetAccount.accountName}`
                : "Default Cash / Bank",
            reference: reference || `TX-${Date.now().toString().slice(-6)}`,
            createdBy: req.user._id,
        });

        const populated = await FinancialTransaction.findById(transaction._id)
            .populate("bankAccount", "bankName accountName accountNumber")
            .populate("createdBy", "username fullName");

        res.status(201).json(populated);
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a Financial Transaction (reverses bank balance effect)
// @route   DELETE /api/finances/transactions/:id
// @access  Private (Admin only)
exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await FinancialTransaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.bankAccount) {
            const account = await BankAccount.findById(transaction.bankAccount);
            if (account) {
                // Reverse balance change
                if (transaction.type === "credit") {
                    account.balance -= transaction.amount;
                } else {
                    account.balance += transaction.amount;
                }
                await account.save();
            }
        }

        await FinancialTransaction.findByIdAndDelete(id);
        res.status(200).json({ message: "Transaction deleted and balance adjusted", id });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Staff Salaries & Roster
// @route   GET /api/finances/salaries
// @access  Private (Admin only)
exports.getStaffSalaries = async (req, res) => {
    try {
        const users = await User.find({ isActive: true }).select(
            "username fullName email role department jobTitle profilePhoto"
        );
        const existingSalaries = await StaffSalary.find().populate(
            "staff",
            "username fullName email role department jobTitle profilePhoto"
        );

        // Build complete roster including users without salary records yet
        const salaryMap = {};
        existingSalaries.forEach((s) => {
            if (s.staff) {
                salaryMap[s.staff._id.toString()] = s;
            }
        });

        const roster = users.map((u) => {
            const uid = u._id.toString();
            if (salaryMap[uid]) {
                return salaryMap[uid];
            }
            // Default placeholder object for UI
            return {
                _id: null,
                staff: u,
                designation: u.jobTitle || "Staff Member",
                department: u.department || "General",
                baseSalary: 0,
                currency: "NGN",
                bonuses: 0,
                deductions: 0,
                paymentStatus: "pending",
                lastPaidDate: null,
                paymentHistory: [],
                notes: "",
            };
        });

        res.status(200).json(roster);
    } catch (error) {
        console.error("Error fetching staff salaries:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upsert Staff Salary structure
// @route   PUT /api/finances/salaries/:staffId
// @access  Private (Admin only)
exports.upsertStaffSalary = async (req, res) => {
    try {
        const { staffId } = req.params;
        const {
            designation,
            department,
            baseSalary,
            currency,
            bonuses,
            deductions,
            bankName,
            accountNumber,
            accountName,
            notes,
        } = req.body;

        const updateData = {
            designation: designation || "Staff Member",
            department: department || "General",
            baseSalary: Number(baseSalary) || 0,
            currency: currency || "NGN",
            bonuses: Number(bonuses) || 0,
            deductions: Number(deductions) || 0,
            bankName: bankName || "",
            accountNumber: accountNumber || "",
            accountName: accountName || "",
            notes: notes || "",
        };

        const salary = await StaffSalary.findOneAndUpdate(
            { staff: staffId },
            { $set: updateData },
            { new: true, upsert: true }
        ).populate("staff", "username fullName email role department jobTitle profilePhoto");

        res.status(200).json(salary);
    } catch (error) {
        console.error("Error updating staff salary:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record Staff Salary Payment (with auto-debit transaction)
// @route   POST /api/finances/salaries/:staffId/pay
// @access  Private (Admin only)
exports.recordSalaryPayment = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { amountPaid, monthYear, reference, note, bankAccountId } = req.body;

        const staffMember = await User.findById(staffId);
        if (!staffMember) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        let salary = await StaffSalary.findOne({ staff: staffId });
        if (!salary) {
            salary = await StaffSalary.create({
                staff: staffId,
                baseSalary: Number(amountPaid) || 0,
            });
        }

        const paidAmount = Number(amountPaid) || (salary.baseSalary + salary.bonuses - salary.deductions);
        const currentMonthYear = monthYear || new Date().toLocaleString("default", { month: "long", year: "numeric" });

        salary.paymentStatus = "paid";
        salary.lastPaidDate = new Date();
        salary.paymentHistory.unshift({
            amountPaid: paidAmount,
            monthYear: currentMonthYear,
            paidAt: new Date(),
            reference: reference || `SAL-${Date.now().toString().slice(-6)}`,
            note: note || `Monthly salary for ${currentMonthYear}`,
        });

        await salary.save();

        // Adjust Bank Account if chosen
        let targetAccount = null;
        if (bankAccountId) {
            targetAccount = await BankAccount.findById(bankAccountId);
            if (targetAccount) {
                targetAccount.balance -= paidAmount;
                await targetAccount.save();
            }
        }

        // Record Debit Transaction
        const transaction = await FinancialTransaction.create({
            type: "debit",
            amount: paidAmount,
            category: "Staff Salary",
            description: `Salary Payment (${currentMonthYear}) to ${staffMember.fullName || staffMember.username}`,
            date: getTodayStr(),
            bankAccount: targetAccount ? targetAccount._id : null,
            bankAccountName: targetAccount ? `${targetAccount.bankName} - ${targetAccount.accountName}` : "Salary Account",
            reference: reference || `SAL-${staffMember.username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
            createdBy: req.user._id,
        });

        const updatedSalary = await StaffSalary.findById(salary._id).populate(
            "staff",
            "username fullName email role department jobTitle profilePhoto"
        );

        res.status(200).json({
            salary: updatedSalary,
            transaction,
        });
    } catch (error) {
        console.error("Error recording salary payment:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bank Accounts Management
// @route   GET /api/finances/bank-accounts
// @access  Private (Admin only)
exports.getBankAccounts = async (req, res) => {
    try {
        const accounts = await BankAccount.find().sort({ isDefault: -1, createdAt: 1 });
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBankAccount = async (req, res) => {
    try {
        const { accountName, bankName, accountNumber, balance, currency, isDefault, notes } = req.body;
        if (!accountName || !bankName || !accountNumber) {
            return res.status(400).json({ message: "Account name, bank name and account number are required" });
        }

        if (isDefault) {
            await BankAccount.updateMany({}, { isDefault: false });
        }

        const account = await BankAccount.create({
            accountName,
            bankName,
            accountNumber,
            balance: Number(balance) || 0,
            currency: currency || "NGN",
            isDefault: Boolean(isDefault),
            notes: notes || "",
        });

        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBankAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountName, bankName, accountNumber, balance, currency, isDefault, notes } = req.body;

        if (isDefault) {
            await BankAccount.updateMany({ _id: { $ne: id } }, { isDefault: false });
        }

        const account = await BankAccount.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(accountName && { accountName }),
                    ...(bankName && { bankName }),
                    ...(accountNumber && { accountNumber }),
                    ...(balance !== undefined && { balance: Number(balance) }),
                    ...(currency && { currency }),
                    ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
                    ...(notes !== undefined && { notes }),
                },
            },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBankAccount = async (req, res) => {
    try {
        const { id } = req.params;
        await BankAccount.findByIdAndDelete(id);
        res.status(200).json({ message: "Bank account deleted successfully", id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
