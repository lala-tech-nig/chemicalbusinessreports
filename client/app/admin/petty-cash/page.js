"use client";

import { useEffect, useState } from "react";
import {
    Receipt,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    FileText,
    Check,
    Search,
    Filter,
    Building2,
    CreditCard,
    ArrowUpRight,
    X,
    User,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import {
    fetchPettyCashRequests,
    reviewPettyCashRequest,
    reimbursePettyCashRequest,
    fetchBankAccounts,
    fetchUsers,
} from "@/lib/api";

export default function AdminPettyCashManagement() {
    const [requests, setRequests] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [summary, setSummary] = useState({
        totalPending: 0,
        totalApproved: 0,
        totalReimbursed: 0,
        count: 0,
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [staffFilter, setStaffFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [reviewModalClaim, setReviewModalClaim] = useState(null);
    const [reviewStatus, setReviewStatus] = useState("approved");
    const [reviewNote, setReviewNote] = useState("");

    const [reimburseModalClaim, setReimburseModalClaim] = useState(null);
    const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
    const [reimburseRef, setReimburseRef] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const [pettyRes, banksRes, usersRes] = await Promise.all([
                fetchPettyCashRequests({
                    status: statusFilter === "all" ? "" : statusFilter,
                    staffId: staffFilter === "all" ? "" : staffFilter,
                    search: searchQuery,
                }),
                fetchBankAccounts().catch(() => []),
                fetchUsers().catch(() => []),
            ]);

            if (pettyRes) {
                setRequests(pettyRes.requests || []);
                setSummary(
                    pettyRes.summary || {
                        totalPending: 0,
                        totalApproved: 0,
                        totalReimbursed: 0,
                        count: 0,
                    }
                );
            }
            if (Array.isArray(banksRes)) {
                setBankAccounts(banksRes);
                if (banksRes.length > 0 && !selectedBankAccountId) {
                    setSelectedBankAccountId(banksRes[0]._id);
                }
            }
            if (Array.isArray(usersRes)) {
                setUsersList(usersRes);
            }
        } catch (err) {
            console.error("Error loading petty cash data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [statusFilter, staffFilter]);

    // Submit Review (Approve or Deny)
    const handleConfirmReview = async (e) => {
        e.preventDefault();
        if (!reviewModalClaim) return;
        try {
            const updated = await reviewPettyCashRequest(reviewModalClaim._id, {
                status: reviewStatus,
                adminNote: reviewNote.trim(),
            });
            setRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
            setReviewModalClaim(null);
            setReviewNote("");
            loadData();
        } catch (err) {
            alert(err.message || "Failed to review claim");
        }
    };

    // Submit Reimbursement (Mark paid & auto debit company cashflow)
    const handleConfirmReimburse = async (e) => {
        e.preventDefault();
        if (!reimburseModalClaim) return;
        try {
            const res = await reimbursePettyCashRequest(reimburseModalClaim._id, {
                bankAccountId: selectedBankAccountId,
                reference: reimburseRef.trim(),
            });
            setRequests((prev) =>
                prev.map((r) => (r._id === res.request._id ? res.request : r))
            );
            setReimburseModalClaim(null);
            setReimburseRef("");
            alert("Claim successfully marked as reimbursed and debit recorded in company ledger!");
            loadData();
        } catch (err) {
            alert(err.message || "Failed to reimburse claim");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-border shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span>Petty Cash Reimbursement Approvals</span>
                        <Receipt className="w-5 h-5 text-indigo-600" />
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Review staff daily out-of-pocket expenses, approve/deny claims, and disburse payouts with auto-ledger debit synchronization.
                    </p>
                </div>

                <button
                    onClick={loadData}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-colors shadow-xs"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Pending Admin Review
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-amber-600">
                            ₦{summary.totalPending?.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            Action Required
                        </span>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Approved (Awaiting Disbursement)
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-blue-600">
                            ₦{summary.totalApproved?.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            Ready to Pay
                        </span>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Total Reimbursed & Settled
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-emerald-600">
                            ₦{summary.totalReimbursed?.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Paid Out
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search purpose, category..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-input rounded-lg focus:outline-none"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-lg text-foreground focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="reimbursed">Reimbursed</option>
                        <option value="denied">Denied</option>
                    </select>
                </div>

                {/* Staff Filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Staff:</span>
                    <select
                        value={staffFilter}
                        onChange={(e) => setStaffFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-lg text-foreground focus:outline-none"
                    >
                        <option value="all">All Staff</option>
                        {usersList.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.fullName || u.username}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Staff Member</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Purpose / Description</th>
                                <th className="py-3 px-4">Receipt</th>
                                <th className="py-3 px-4">Staff Bank Account</th>
                                <th className="py-3 px-4 text-right">Amount (NGN)</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                                        Loading claims...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                                        No reimbursement requests matching filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((claim) => (
                                    <tr key={claim._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                                            {claim.date}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {claim.staff?.profilePhoto ? (
                                                    <img
                                                        src={claim.staff.profilePhoto}
                                                        alt={claim.staff.username}
                                                        className="w-6 h-6 rounded-full object-cover border border-border"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center">
                                                        {claim.staff?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-foreground block">
                                                        {claim.staff?.fullName || claim.staff?.username}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {claim.staff?.department || "General"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-muted text-foreground text-[11px] font-medium">
                                                {claim.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-foreground max-w-xs">
                                            {claim.purpose}
                                            {claim.adminNote && (
                                                <div className="text-[10px] text-muted-foreground italic mt-0.5">
                                                    Note: "{claim.adminNote}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            {claim.receiptUrl ? (
                                                <a
                                                    href={claim.receiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-[11px]"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>View Proof</span>
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-[11px]">None</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground max-w-[150px] truncate">
                                            {claim.bankAccountDetails || "On file"}
                                        </td>
                                        <td className="py-3 px-4 text-right font-extrabold text-foreground whitespace-nowrap">
                                            ₦{claim.amount?.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            {claim.status === "pending" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Pending</span>
                                                </span>
                                            )}
                                            {claim.status === "approved" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Approved</span>
                                                </span>
                                            )}
                                            {claim.status === "reimbursed" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <Check className="w-3 h-3" />
                                                    <span>Reimbursed</span>
                                                </span>
                                            )}
                                            {claim.status === "denied" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <XCircle className="w-3 h-3" />
                                                    <span>Denied</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {claim.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setReviewModalClaim(claim);
                                                                setReviewStatus("approved");
                                                                setReviewNote("");
                                                            }}
                                                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px] transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setReviewModalClaim(claim);
                                                                setReviewStatus("denied");
                                                                setReviewNote("");
                                                            }}
                                                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold text-[11px] transition-colors"
                                                        >
                                                            Deny
                                                        </button>
                                                    </>
                                                )}

                                                {claim.status === "approved" && (
                                                    <button
                                                        onClick={() => {
                                                            setReimburseModalClaim(claim);
                                                            setReimburseRef(
                                                                `PC-REIMB-${claim._id.slice(-5).toUpperCase()}`
                                                            );
                                                        }}
                                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-[11px] transition-colors shadow-xs"
                                                    >
                                                        Pay & Reimburse
                                                    </button>
                                                )}

                                                {claim.status === "reimbursed" && (
                                                    <span className="text-[11px] text-emerald-600 font-semibold">
                                                        Settled
                                                    </span>
                                                )}

                                                {claim.status === "denied" && (
                                                    <span className="text-[11px] text-rose-500 font-semibold">
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Claim Modal (Approve / Deny) */}
            {reviewModalClaim && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="text-base font-bold text-foreground">
                                {reviewStatus === "approved" ? "Approve Claim" : "Deny Claim"}
                            </h3>
                            <button
                                onClick={() => setReviewModalClaim(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-foreground">
                                <span>{reviewModalClaim.staff?.fullName || reviewModalClaim.staff?.username}</span>
                                <span>₦{reviewModalClaim.amount?.toLocaleString()}</span>
                            </div>
                            <p className="text-muted-foreground">{reviewModalClaim.purpose}</p>
                        </div>

                        <form onSubmit={handleConfirmReview} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">
                                    Administrative Feedback / Reason (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder={
                                        reviewStatus === "approved"
                                            ? "e.g., Approved for payment processing"
                                            : "e.g., Incomplete receipt or expense not pre-authorized"
                                    }
                                    className="w-full px-3 py-2 text-xs bg-muted/30 border border-input rounded-xl focus:outline-none text-foreground"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewModalClaim(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs ${
                                        reviewStatus === "approved"
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : "bg-rose-600 hover:bg-rose-700"
                                    }`}
                                >
                                    Confirm {reviewStatus === "approved" ? "Approval" : "Denial"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay & Reimburse Modal (With Auto Debit Synchronization) */}
            {reimburseModalClaim && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-border animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <span>Disburse Reimbursement</span>
                                <Building2 className="w-4 h-4 text-indigo-600" />
                            </h3>
                            <button
                                onClick={() => setReimburseModalClaim(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-indigo-50/60 rounded-xl space-y-1 text-xs border border-indigo-100">
                            <div className="flex justify-between font-bold text-indigo-950">
                                <span>Payout to: {reimburseModalClaim.staff?.fullName || reimburseModalClaim.staff?.username}</span>
                                <span>₦{reimburseModalClaim.amount?.toLocaleString()}</span>
                            </div>
                            <p className="text-indigo-800 font-mono">
                                Bank: {reimburseModalClaim.bankAccountDetails || "See staff record"}
                            </p>
                        </div>

                        <form onSubmit={handleConfirmReimburse} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">
                                    Disburse from Company Bank Account *
                                </label>
                                <select
                                    required
                                    value={selectedBankAccountId}
                                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                >
                                    <option value="">Select Company Account</option>
                                    {bankAccounts.map((b) => (
                                        <option key={b._id} value={b._id}>
                                            {b.bankName} - {b.accountName} (Balance: ₦{b.balance?.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-muted-foreground">
                                    ₦{reimburseModalClaim.amount?.toLocaleString()} will be automatically deducted from this account and recorded in Cashflow Debits.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground">
                                    Payment Reference
                                </label>
                                <input
                                    type="text"
                                    value={reimburseRef}
                                    onChange={(e) => setReimburseRef(e.target.value)}
                                    placeholder="e.g. NIP/2026/09/PC-4029"
                                    className="w-full px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none text-foreground"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setReimburseModalClaim(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                                >
                                    Confirm Disbursement & Record Debit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
