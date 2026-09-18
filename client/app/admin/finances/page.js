"use client";

import { useEffect, useState } from "react";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Building2,
    DollarSign,
    Users,
    CreditCard,
    Plus,
    Calendar,
    Search,
    Filter,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    X,
    Trash2,
    RefreshCw,
    PieChart,
    Layers,
    FileText,
} from "lucide-react";
import {
    fetchFinanceOverview,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    fetchStaffSalaries,
    upsertStaffSalary,
    recordSalaryPayment,
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
} from "@/lib/api";

const TRANSACTION_CATEGORIES = {
    credit: [
        "Client Inflow / Sales",
        "Subscription & Reports",
        "Advertising Inflow",
        "Consulting Fee",
        "Investment / Capital",
        "Refund Inflow",
        "Other Inflow",
    ],
    debit: [
        "Staff Salary",
        "Petty Cash Reimbursement",
        "Office Rent & Facilities",
        "Internet & Utilities",
        "Software & Servers",
        "Travel & Field Work",
        "Marketing & Ads",
        "Taxes & Regulatory",
        "Other Expense",
    ],
};

export default function AdminFinanceManagement() {
    const [activeTab, setActiveTab] = useState("overview"); // "overview", "transactions", "salaries", "bankAccounts"
    const [overviewData, setOverviewData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [salariesRoster, setSalariesRoster] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters for transactions
    const [txTypeFilter, setTxTypeFilter] = useState("all");
    const [txCategoryFilter, setTxCategoryFilter] = useState("all");
    const [txSearch, setTxSearch] = useState("");

    // Modals
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [txFormData, setTxFormData] = useState({
        type: "credit",
        amount: "",
        category: "Client Inflow / Sales",
        description: "",
        date: new Date().toISOString().split("T")[0],
        bankAccountId: "",
        reference: "",
    });

    const [editingSalaryStaff, setEditingSalaryStaff] = useState(null);
    const [salaryFormData, setSalaryFormData] = useState({
        designation: "",
        department: "",
        baseSalary: 0,
        bonuses: 0,
        deductions: 0,
        bankName: "",
        accountNumber: "",
        accountName: "",
        notes: "",
    });

    const [payingSalaryStaff, setPayingSalaryStaff] = useState(null);
    const [paySalaryData, setPaySalaryData] = useState({
        amountPaid: "",
        monthYear: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        bankAccountId: "",
        reference: "",
        note: "",
    });

    const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
    const [bankFormData, setBankFormData] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        balance: 0,
        isDefault: false,
    });

    const [editingAccount, setEditingAccount] = useState(null);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [ov, txs, sals, banks] = await Promise.all([
                fetchFinanceOverview(),
                fetchTransactions({
                    type: txTypeFilter === "all" ? "" : txTypeFilter,
                    category: txCategoryFilter === "all" ? "" : txCategoryFilter,
                    search: txSearch,
                }),
                fetchStaffSalaries(),
                fetchBankAccounts(),
            ]);

            setOverviewData(ov);
            setTransactions(txs || []);
            setSalariesRoster(sals || []);
            setBankAccounts(banks || []);
        } catch (err) {
            console.error("Error loading financial data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, [txTypeFilter, txCategoryFilter]);

    // Handle Create Transaction
    const handleCreateTx = async (e) => {
        e.preventDefault();
        try {
            await createTransaction({
                ...txFormData,
                amount: Number(txFormData.amount),
            });
            setIsAddTxModalOpen(false);
            setTxFormData({
                type: "credit",
                amount: "",
                category: "Client Inflow / Sales",
                description: "",
                date: new Date().toISOString().split("T")[0],
                bankAccountId: "",
                reference: "",
            });
            loadAll();
        } catch (err) {
            alert(err.message || "Failed to add transaction");
        }
    };

    // Handle Delete Transaction
    const handleDeleteTx = async (id) => {
        if (!confirm("Are you sure? This will reverse the amount from the bank balance.")) return;
        try {
            await deleteTransaction(id);
            setTransactions((prev) => prev.filter((t) => t._id !== id));
            loadAll();
        } catch (err) {
            alert(err.message || "Failed to delete transaction");
        }
    };

    // Handle Update Salary Structure
    const handleSaveSalary = async (e) => {
        e.preventDefault();
        if (!editingSalaryStaff) return;
        try {
            await upsertStaffSalary(editingSalaryStaff.staff._id, salaryFormData);
            setEditingSalaryStaff(null);
            loadAll();
        } catch (err) {
            alert(err.message || "Failed to update salary");
        }
    };

    // Handle Pay Salary
    const handleConfirmPaySalary = async (e) => {
        e.preventDefault();
        if (!payingSalaryStaff) return;
        try {
            await recordSalaryPayment(payingSalaryStaff.staff._id, paySalaryData);
            setPayingSalaryStaff(null);
            alert("Salary payment successfully logged and recorded as debit in company ledger!");
            loadAll();
        } catch (err) {
            alert(err.message || "Failed to record salary payment");
        }
    };

    // Handle Add Bank Account
    const handleCreateBankAccount = async (e) => {
        e.preventDefault();
        try {
            await createBankAccount(bankFormData);
            setIsAddBankModalOpen(false);
            setBankFormData({
                bankName: "",
                accountName: "",
                accountNumber: "",
                balance: 0,
                isDefault: false,
            });
            loadAll();
        } catch (err) {
            alert(err.message || "Failed to add bank account");
        }
    };

    // Handle Update Bank Balance
    const handleUpdateBankBalance = async (e) => {
        e.preventDefault();
        if (!editingAccount) return;
        try {
            await updateBankAccount(editingAccount._id, { balance: Number(editingAccount.balance) });
            setEditingAccount(null);
            loadAll();
        } catch (err) {
            alert(err.message || "Failed to update balance");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-border shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span>Financial Accounts & Cashflow Management</span>
                        <Wallet className="w-6 h-6 text-indigo-600" />
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Manage company bank balances, inflows, debits & credits, staff payroll & salaries, and cashflow charts.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadAll}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-colors shadow-xs"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => setIsAddTxModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            {/* Financial Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Total Company Bank Balance
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-foreground">
                            ₦{overviewData?.totalBankBalance?.toLocaleString() || 0}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {overviewData?.bankAccounts?.length || 0} Accounts
                        </span>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        This Month's Inflow (Credits)
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-emerald-600">
                            ₦{overviewData?.thisMonth?.inflows?.toLocaleString() || 0}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Inflow</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        This Month's Outflow (Debits)
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-rose-600">
                            ₦{overviewData?.thisMonth?.outflows?.toLocaleString() || 0}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Net Monthly Cashflow
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span
                            className={`text-2xl font-extrabold ${
                                (overviewData?.thisMonth?.net || 0) >= 0
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                            }`}
                        >
                            ₦{overviewData?.thisMonth?.net?.toLocaleString() || 0}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                            Net
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border shadow-xs w-fit">
                {[
                    { id: "overview", label: "Financial Cashflow Analytics", icon: PieChart },
                    { id: "transactions", label: "Credit & Debit Ledger", icon: FileText },
                    { id: "salaries", label: "Staff Salaries & Payroll", icon: Users },
                    { id: "bankAccounts", label: "Bank Accounts & Balances", icon: Building2 },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                                activeTab === tab.id
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: OVERVIEW & CASHFLOW CHARTS */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Trend Chart */}
                    <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-foreground">
                            6-Month Cashflow Trajectory (Inflows vs Debits)
                        </h3>
                        <div className="h-64 flex items-end justify-between gap-4 pt-8 px-2 border-b border-border">
                            {overviewData?.monthlyTrend?.map((m, idx) => {
                                const maxVal = Math.max(
                                    ...overviewData.monthlyTrend.map((item) =>
                                        Math.max(item.inflows, item.outflows)
                                    ),
                                    10000
                                );
                                const inHeight = ((m.inflows || 0) / maxVal) * 100;
                                const outHeight = ((m.outflows || 0) / maxVal) * 100;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                                            {/* Inflow Bar */}
                                            <div
                                                className="w-full max-w-[20px] bg-emerald-500 rounded-t-sm transition-all shadow-xs"
                                                style={{ height: `${inHeight}%` }}
                                                title={`Inflow: ₦${m.inflows?.toLocaleString()}`}
                                            ></div>
                                            {/* Outflow Bar */}
                                            <div
                                                className="w-full max-w-[20px] bg-rose-400 rounded-t-sm transition-all shadow-xs"
                                                style={{ height: `${outHeight}%` }}
                                                title={`Outflow: ₦${m.outflows?.toLocaleString()}`}
                                            ></div>
                                        </div>
                                        <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
                                            {m.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center gap-6 pt-2 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-xs bg-emerald-500"></div>
                                <span className="text-muted-foreground font-medium">Inflows (Credits)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-xs bg-rose-400"></div>
                                <span className="text-muted-foreground font-medium">Outflows (Debits)</span>
                            </div>
                        </div>
                    </div>

                    {/* Expense Breakdown by Category */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-foreground">
                            Expense Distribution This Month
                        </h3>
                        {overviewData?.expenseBreakdown?.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-12 text-center">
                                No debits recorded this month yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {overviewData?.expenseBreakdown?.map((cat, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-foreground">{cat.category}</span>
                                            <span className="text-muted-foreground">
                                                ₦{cat.amount?.toLocaleString()} ({cat.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-full rounded-full"
                                                style={{ width: `${cat.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-4 border-t border-border space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Monthly Salary Liability:</span>
                                <span className="font-bold text-foreground">
                                    ₦{overviewData?.salaryLiability?.toLocaleString() || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Pending Reimbursements:</span>
                                <span className="font-bold text-amber-600">
                                    ₦{overviewData?.pendingReimbursements?.amount?.toLocaleString() || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: TRANSACTIONS LEDGER */}
            {activeTab === "transactions" && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Type:</span>
                            <select
                                value={txTypeFilter}
                                onChange={(e) => setTxTypeFilter(e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-lg text-foreground focus:outline-none"
                            >
                                <option value="all">All Inflows & Debits</option>
                                <option value="credit">🟢 Credits (Inflows)</option>
                                <option value="debit">🔴 Debits (Outflows)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Category:</span>
                            <select
                                value={txCategoryFilter}
                                onChange={(e) => setTxCategoryFilter(e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-lg text-foreground focus:outline-none"
                            >
                                <option value="all">All Categories</option>
                                {[...TRANSACTION_CATEGORIES.credit, ...TRANSACTION_CATEGORIES.debit].map(
                                    (c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4">Bank Account</th>
                                        <th className="py-3 px-4">Reference</th>
                                        <th className="py-3 px-4 text-right">Amount (NGN)</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                                                    {tx.date}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {tx.type === "credit" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <ArrowDownRight className="w-3 h-3" />
                                                            <span>Credit (Inflow)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            <ArrowUpRight className="w-3 h-3" />
                                                            <span>Debit (Outflow)</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-foreground">
                                                    {tx.category}
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                                                    {tx.description}
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground">
                                                    {tx.bankAccount?.bankName || tx.bankAccountName || "Cash"}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                                                    {tx.reference}
                                                </td>
                                                <td
                                                    className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                                                        tx.type === "credit"
                                                            ? "text-emerald-600"
                                                            : "text-rose-600"
                                                    }`}
                                                >
                                                    {tx.type === "credit" ? "+" : "-"}₦
                                                    {tx.amount?.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteTx(tx._id)}
                                                        className="text-muted-foreground hover:text-destructive p-1"
                                                        title="Delete & reverse balance"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: STAFF SALARIES & PAYROLL */}
            {activeTab === "salaries" && (
                <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Staff Salaries & Payroll Roster</h3>
                            <p className="text-xs text-muted-foreground">
                                Manage salary packages, record monthly payouts, and synchronize directly with bank debit ledgers.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Staff Member</th>
                                    <th className="py-3 px-4">Department & Role</th>
                                    <th className="py-3 px-4 text-right">Base Salary</th>
                                    <th className="py-3 px-4 text-right">Bonuses</th>
                                    <th className="py-3 px-4 text-right">Deductions</th>
                                    <th className="py-3 px-4 text-right">Net Monthly Salary</th>
                                    <th className="py-3 px-4">Staff Bank Details</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Payroll Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {salariesRoster.map((item) => {
                                    const net = (item.baseSalary || 0) + (item.bonuses || 0) - (item.deductions || 0);

                                    return (
                                        <tr key={item.staff?._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {item.staff?.profilePhoto ? (
                                                        <img
                                                            src={item.staff.profilePhoto}
                                                            alt={item.staff.username}
                                                            className="w-6 h-6 rounded-full object-cover border border-border"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center">
                                                            {item.staff?.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-semibold text-foreground block">
                                                            {item.staff?.fullName || item.staff?.username}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            @{item.staff?.username}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {item.department || item.staff?.department || "General"} •{" "}
                                                {item.designation || item.staff?.role}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-foreground">
                                                ₦{item.baseSalary?.toLocaleString() || 0}
                                            </td>
                                            <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                                                +₦{item.bonuses?.toLocaleString() || 0}
                                            </td>
                                            <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                                                -₦{item.deductions?.toLocaleString() || 0}
                                            </td>
                                            <td className="py-3 px-4 text-right font-extrabold text-foreground">
                                                ₦{net > 0 ? net.toLocaleString() : 0}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                                                {item.bankName
                                                    ? `${item.bankName} - ${item.accountNumber}`
                                                    : "Not set"}
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {item.paymentStatus === "paid" ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingSalaryStaff(item);
                                                            setSalaryFormData({
                                                                designation: item.designation || "Staff Member",
                                                                department: item.department || "General",
                                                                baseSalary: item.baseSalary || 0,
                                                                bonuses: item.bonuses || 0,
                                                                deductions: item.deductions || 0,
                                                                bankName: item.bankName || "",
                                                                accountNumber: item.accountNumber || "",
                                                                accountName: item.accountName || "",
                                                                notes: item.notes || "",
                                                            });
                                                        }}
                                                        className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg transition-colors border border-border"
                                                    >
                                                        Edit Salary
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPayingSalaryStaff(item);
                                                            setPaySalaryData({
                                                                amountPaid: net > 0 ? net : item.baseSalary,
                                                                monthYear: new Date().toLocaleString("default", {
                                                                    month: "long",
                                                                    year: "numeric",
                                                                }),
                                                                bankAccountId: bankAccounts[0]?._id || "",
                                                                reference: `SAL-${item.staff.username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
                                                                note: `Salary disbursement for ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
                                                            });
                                                        }}
                                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                                                    >
                                                        Pay Salary
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: BANK ACCOUNTS & BALANCES */}
            {activeTab === "bankAccounts" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Company Bank Accounts</h3>
                            <p className="text-xs text-muted-foreground">
                                Track real-time balances, add accounts, and adjust reserves.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddBankModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Bank Account</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bankAccounts.map((account) => (
                            <div
                                key={account._id}
                                className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-4 flex flex-col justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                                            <Building2 className="w-4 h-4 text-indigo-600" />
                                            <span>{account.bankName}</span>
                                        </div>
                                        {account.isDefault && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {account.accountName}
                                    </p>
                                    <p className="font-mono text-xs text-foreground">
                                        Account No: {account.accountNumber}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-border flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                                            Current Balance
                                        </span>
                                        <span className="text-xl font-extrabold text-foreground">
                                            ₦{account.balance?.toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setEditingAccount(account)}
                                        className="px-3 py-1 text-xs font-semibold text-primary hover:bg-accent rounded-lg border border-border"
                                    >
                                        Edit Balance
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL: ADD TRANSACTION */}
            {isAddTxModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">Record Financial Transaction</h3>
                            <button
                                onClick={() => setIsAddTxModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTx} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTxFormData((prev) => ({
                                            ...prev,
                                            type: "credit",
                                            category: TRANSACTION_CATEGORIES.credit[0],
                                        }))
                                    }
                                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                                        txFormData.type === "credit"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                            : "bg-muted/40 text-muted-foreground border-border"
                                    }`}
                                >
                                    + Credit (Inflow)
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTxFormData((prev) => ({
                                            ...prev,
                                            type: "debit",
                                            category: TRANSACTION_CATEGORIES.debit[0],
                                        }))
                                    }
                                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                                        txFormData.type === "debit"
                                            ? "bg-rose-50 text-rose-700 border-rose-300"
                                            : "bg-muted/40 text-muted-foreground border-border"
                                    }`}
                                >
                                    - Debit (Outflow)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Amount (NGN) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={txFormData.amount}
                                        onChange={(e) =>
                                            setTxFormData((prev) => ({ ...prev, amount: e.target.value }))
                                        }
                                        placeholder="e.g. 50000"
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Date</label>
                                    <input
                                        type="date"
                                        value={txFormData.date}
                                        onChange={(e) =>
                                            setTxFormData((prev) => ({ ...prev, date: e.target.value }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Category *</label>
                                <select
                                    value={txFormData.category}
                                    onChange={(e) =>
                                        setTxFormData((prev) => ({ ...prev, category: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                >
                                    {(txFormData.type === "credit"
                                        ? TRANSACTION_CATEGORIES.credit
                                        : TRANSACTION_CATEGORIES.debit
                                    ).map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Company Bank Account</label>
                                <select
                                    value={txFormData.bankAccountId}
                                    onChange={(e) =>
                                        setTxFormData((prev) => ({
                                            ...prev,
                                            bankAccountId: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                >
                                    <option value="">None / Cash</option>
                                    {bankAccounts.map((b) => (
                                        <option key={b._id} value={b._id}>
                                            {b.bankName} - {b.accountName} (₦{b.balance?.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Description</label>
                                <input
                                    type="text"
                                    value={txFormData.description}
                                    onChange={(e) =>
                                        setTxFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Chemical business report quarterly licensing"
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Reference / Transaction ID</label>
                                <input
                                    type="text"
                                    value={txFormData.reference}
                                    onChange={(e) =>
                                        setTxFormData((prev) => ({
                                            ...prev,
                                            reference: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. TX-2026-902"
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsAddTxModalOpen(false)}
                                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                                >
                                    Record Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT SALARY STRUCTURE */}
            {editingSalaryStaff && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-border animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">
                                Edit Salary: {editingSalaryStaff.staff?.fullName || editingSalaryStaff.staff?.username}
                            </h3>
                            <button
                                onClick={() => setEditingSalaryStaff(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSalary} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Designation / Role</label>
                                    <input
                                        type="text"
                                        value={salaryFormData.designation}
                                        onChange={(e) =>
                                            setSalaryFormData((prev) => ({
                                                ...prev,
                                                designation: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Department</label>
                                    <input
                                        type="text"
                                        value={salaryFormData.department}
                                        onChange={(e) =>
                                            setSalaryFormData((prev) => ({
                                                ...prev,
                                                department: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Base Salary (NGN)</label>
                                    <input
                                        type="number"
                                        value={salaryFormData.baseSalary}
                                        onChange={(e) =>
                                            setSalaryFormData((prev) => ({
                                                ...prev,
                                                baseSalary: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Bonuses</label>
                                    <input
                                        type="number"
                                        value={salaryFormData.bonuses}
                                        onChange={(e) =>
                                            setSalaryFormData((prev) => ({
                                                ...prev,
                                                bonuses: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Deductions</label>
                                    <input
                                        type="number"
                                        value={salaryFormData.deductions}
                                        onChange={(e) =>
                                            setSalaryFormData((prev) => ({
                                                ...prev,
                                                deductions: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Staff Bank Name</label>
                                    <input
                                        type="text"
                                        value={salaryFormData.bankName}
                                        onChange={(e) =>
                                            setSalaryFormData((prev) => ({
                                                ...prev,
                                                bankName: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. Zenith Bank"
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Account Number</label>
                                    <input
                                        type="text"
                                        value={salaryFormData.accountNumber}
                                        onChange={(e) =>
                                            setSalaryFormData((prev) => ({
                                                ...prev,
                                                accountNumber: e.target.value,
                                            }))
                                        }
                                        placeholder="10-digit NUBAN"
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setEditingSalaryStaff(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                                >
                                    Save Salary Package
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: PAY SALARY */}
            {payingSalaryStaff && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">
                                Disburse Monthly Salary
                            </h3>
                            <button
                                onClick={() => setPayingSalaryStaff(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-indigo-50/60 rounded-xl space-y-1 text-xs border border-indigo-100">
                            <div className="flex justify-between font-bold text-indigo-950">
                                <span>{payingSalaryStaff.staff?.fullName || payingSalaryStaff.staff?.username}</span>
                                <span>₦{paySalaryData.amountPaid?.toLocaleString()}</span>
                            </div>
                            <p className="text-indigo-800 font-mono">
                                Staff Account: {payingSalaryStaff.bankName || "GTBank"} - {payingSalaryStaff.accountNumber || "0123456789"}
                            </p>
                        </div>

                        <form onSubmit={handleConfirmPaySalary} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Amount to Disburse</label>
                                    <input
                                        type="number"
                                        required
                                        value={paySalaryData.amountPaid}
                                        onChange={(e) =>
                                            setPaySalaryData((prev) => ({
                                                ...prev,
                                                amountPaid: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Payroll Month</label>
                                    <input
                                        type="text"
                                        value={paySalaryData.monthYear}
                                        onChange={(e) =>
                                            setPaySalaryData((prev) => ({
                                                ...prev,
                                                monthYear: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Pay From Company Bank</label>
                                <select
                                    value={paySalaryData.bankAccountId}
                                    onChange={(e) =>
                                        setPaySalaryData((prev) => ({
                                            ...prev,
                                            bankAccountId: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                >
                                    <option value="">None / External</option>
                                    {bankAccounts.map((b) => (
                                        <option key={b._id} value={b._id}>
                                            {b.bankName} - {b.accountName} (Balance: ₦{b.balance?.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Payment Reference</label>
                                <input
                                    type="text"
                                    value={paySalaryData.reference}
                                    onChange={(e) =>
                                        setPaySalaryData((prev) => ({
                                            ...prev,
                                            reference: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setPayingSalaryStaff(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                                >
                                    Confirm Payout & Record Debit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ADD BANK ACCOUNT */}
            {isAddBankModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">Add Company Bank Account</h3>
                            <button
                                onClick={() => setIsAddBankModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBankAccount} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Bank Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Zenith Bank Plc"
                                    value={bankFormData.bankName}
                                    onChange={(e) =>
                                        setBankFormData((prev) => ({ ...prev, bankName: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">Account Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Chemical Business Reports Main Ops"
                                    value={bankFormData.accountName}
                                    onChange={(e) =>
                                        setBankFormData((prev) => ({
                                            ...prev,
                                            accountName: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Account Number *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="10-digit NUBAN"
                                        value={bankFormData.accountNumber}
                                        onChange={(e) =>
                                            setBankFormData((prev) => ({
                                                ...prev,
                                                accountNumber: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Initial Balance (NGN)</label>
                                    <input
                                        type="number"
                                        value={bankFormData.balance}
                                        onChange={(e) =>
                                            setBankFormData((prev) => ({
                                                ...prev,
                                                balance: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={bankFormData.isDefault}
                                    onChange={(e) =>
                                        setBankFormData((prev) => ({
                                            ...prev,
                                            isDefault: e.target.checked,
                                        }))
                                    }
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-xs font-semibold text-foreground">
                                    Set as Primary Company Account
                                </span>
                            </label>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsAddBankModalOpen(false)}
                                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                                >
                                    Add Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT BALANCE */}
            {editingAccount && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-border animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">Adjust Bank Balance</h3>
                            <button
                                onClick={() => setEditingAccount(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateBankBalance} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">
                                    {editingAccount.bankName} - {editingAccount.accountName}
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={editingAccount.balance}
                                    onChange={(e) =>
                                        setEditingAccount((prev) => ({
                                            ...prev,
                                            balance: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-sm bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground font-bold"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setEditingAccount(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                                >
                                    Update Balance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
