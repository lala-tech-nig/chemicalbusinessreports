const express = require("express");
const router = express.Router();
const {
    getFinanceOverview,
    getTransactions,
    createTransaction,
    deleteTransaction,
    getStaffSalaries,
    upsertStaffSalary,
    recordSalaryPayment,
    getBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
} = require("../controllers/financeController");
const { protect, admin } = require("../middleware/authMiddleware");

// All finance routes require admin privileges
router.use(protect);
router.use(admin);

// Overview
router.get("/overview", getFinanceOverview);

// Transactions / Cashflow
router.route("/transactions").get(getTransactions).post(createTransaction);
router.delete("/transactions/:id", deleteTransaction);

// Staff Salaries
router.get("/salaries", getStaffSalaries);
router.put("/salaries/:staffId", upsertStaffSalary);
router.post("/salaries/:staffId/pay", recordSalaryPayment);

// Bank Accounts
router.route("/bank-accounts").get(getBankAccounts).post(createBankAccount);
router.route("/bank-accounts/:id").put(updateBankAccount).delete(deleteBankAccount);

module.exports = router;
