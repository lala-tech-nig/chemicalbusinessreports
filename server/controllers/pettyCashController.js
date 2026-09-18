const PettyCash = require("../models/PettyCash");
const FinancialTransaction = require("../models/FinancialTransaction");
const BankAccount = require("../models/BankAccount");

// Helper to get today's date in YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split("T")[0];

// @desc    Get Petty Cash requests (Staff gets own, Admin gets all)
// @route   GET /api/petty-cash
// @access  Private
exports.getPettyCashRequests = async (req, res) => {
    try {
        const { status, staffId, date, search } = req.query;
        const isAdmin = req.user.role === "admin";

        const query = {};

        if (!isAdmin) {
            query.staff = req.user._id;
        } else if (staffId) {
            query.staff = staffId;
        }

        if (status && status !== "all") {
            query.status = status;
        }

        if (date) {
            query.date = date;
        }

        if (search) {
            query.$or = [
                { purpose: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }

        const requests = await PettyCash.find(query)
            .populate("staff", "username fullName profilePhoto role department")
            .populate("reviewedBy", "username fullName")
            .sort({ createdAt: -1 });

        // Stats summary
        const totalPending = requests.filter((r) => r.status === "pending").reduce((acc, r) => acc + r.amount, 0);
        const totalApproved = requests.filter((r) => r.status === "approved").reduce((acc, r) => acc + r.amount, 0);
        const totalReimbursed = requests.filter((r) => r.status === "reimbursed").reduce((acc, r) => acc + r.amount, 0);

        res.status(200).json({
            requests,
            summary: {
                totalPending,
                totalApproved,
                totalReimbursed,
                count: requests.length,
            },
        });
    } catch (error) {
        console.error("Error fetching petty cash requests:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit new Petty Cash reimbursement claim
// @route   POST /api/petty-cash
// @access  Private
exports.createPettyCashRequest = async (req, res) => {
    try {
        const { amount, purpose, category, date, receiptUrl, bankAccountDetails } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "A valid positive amount is required" });
        }

        if (!purpose || !purpose.trim()) {
            return res.status(400).json({ message: "Purpose of expenditure is required" });
        }

        const request = await PettyCash.create({
            staff: req.user._id,
            date: date || getTodayStr(),
            amount: Number(amount),
            category: category || "Office Supplies",
            purpose: purpose.trim(),
            receiptUrl: receiptUrl || "",
            bankAccountDetails: bankAccountDetails || "",
            status: "pending",
        });

        const populated = await PettyCash.findById(request._id).populate(
            "staff",
            "username fullName profilePhoto role department"
        );

        res.status(201).json(populated);
    } catch (error) {
        console.error("Error creating petty cash request:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin Review (Approve or Deny)
// @route   PUT /api/petty-cash/:id/review
// @access  Private (Admin Only)
exports.reviewPettyCashRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        if (!["approved", "denied"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'approved' or 'denied'" });
        }

        const request = await PettyCash.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = status;
        request.adminNote = adminNote || "";
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        await request.save();

        const populated = await PettyCash.findById(request._id)
            .populate("staff", "username fullName profilePhoto role department")
            .populate("reviewedBy", "username fullName");

        res.status(200).json(populated);
    } catch (error) {
        console.error("Error reviewing petty cash request:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin Mark as Reimbursed & auto-record in Company Financial Ledger
// @route   PUT /api/petty-cash/:id/reimburse
// @access  Private (Admin Only)
exports.reimbursePettyCashRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { bankAccountId, bankAccountName, reference } = req.body;

        const request = await PettyCash.findById(id).populate("staff", "username fullName");
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = "reimbursed";
        request.reimbursedAt = new Date();
        await request.save();

        // Automatically record a debit in Financial Transactions
        let targetAccount = null;
        if (bankAccountId) {
            targetAccount = await BankAccount.findById(bankAccountId);
            if (targetAccount) {
                targetAccount.balance -= request.amount;
                await targetAccount.save();
            }
        }

        const transaction = await FinancialTransaction.create({
            type: "debit",
            amount: request.amount,
            category: "Petty Cash Reimbursement",
            description: `Reimbursement to ${request.staff?.fullName || request.staff?.username || "Staff"}: ${request.purpose}`,
            date: getTodayStr(),
            bankAccount: targetAccount ? targetAccount._id : null,
            bankAccountName: targetAccount ? `${targetAccount.bankName} - ${targetAccount.accountName}` : bankAccountName || "Petty Cash Account",
            reference: reference || `PC-REIMB-${request._id.toString().slice(-6).toUpperCase()}`,
            pettyCashRef: request._id,
            createdBy: req.user._id,
        });

        const populated = await PettyCash.findById(request._id)
            .populate("staff", "username fullName profilePhoto role department")
            .populate("reviewedBy", "username fullName");

        res.status(200).json({
            request: populated,
            transaction,
        });
    } catch (error) {
        console.error("Error reimbursing petty cash:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Petty Cash claim
// @route   DELETE /api/petty-cash/:id
// @access  Private
exports.deletePettyCashRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await PettyCash.findById(id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        const isOwner = request.staff.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isAdmin && (!isOwner || request.status !== "pending")) {
            return res.status(403).json({ message: "Cannot delete this request" });
        }

        await PettyCash.findByIdAndDelete(id);
        res.status(200).json({ message: "Request deleted successfully", id });
    } catch (error) {
        console.error("Error deleting petty cash request:", error);
        res.status(500).json({ message: error.message });
    }
};
