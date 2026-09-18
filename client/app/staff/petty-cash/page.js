"use client";

import { useEffect, useState } from "react";
import {
    Receipt,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    DollarSign,
    Upload,
    FileText,
    Calendar,
    Tag,
    Trash2,
    AlertCircle,
    X,
    CreditCard,
    Building,
    Check,
} from "lucide-react";
import {
    fetchPettyCashRequests,
    createPettyCashRequest,
    deletePettyCashRequest,
    uploadFile,
} from "@/lib/api";

const CATEGORIES = [
    "Travel & Logistics",
    "Office Supplies",
    "Meals & Refreshments",
    "Utility / Repairs",
    "Client Hosting",
    "Field Work / Research",
    "Other",
];

const getTodayStr = () => new Date().toISOString().split("T")[0];

export default function StaffPettyCashPortal() {
    const [requests, setRequests] = useState([]);
    const [summary, setSummary] = useState({
        totalPending: 0,
        totalApproved: 0,
        totalReimbursed: 0,
        count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        date: getTodayStr(),
        amount: "",
        category: "Office Supplies",
        purpose: "",
        receiptUrl: "",
        bankAccountDetails: "",
    });

    const loadClaims = async () => {
        try {
            setLoading(true);
            const res = await fetchPettyCashRequests({
                status: statusFilter === "all" ? "" : statusFilter,
            });
            if (res) {
                setRequests(res.requests || []);
                setSummary(
                    res.summary || {
                        totalPending: 0,
                        totalApproved: 0,
                        totalReimbursed: 0,
                        count: 0,
                    }
                );
            }
        } catch (err) {
            console.error("Error fetching claims:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClaims();
    }, [statusFilter]);

    // Handle receipt file upload
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingReceipt(true);
            const uploadRes = await uploadFile(file);
            if (uploadRes && uploadRes.url) {
                setFormData((prev) => ({ ...prev, receiptUrl: uploadRes.url }));
            }
        } catch (err) {
            alert(err.message || "Failed to upload receipt");
        } finally {
            setUploadingReceipt(false);
        }
    };

    // Handle form submit
    const handleSubmitClaim = async (e) => {
        e.preventDefault();
        try {
            await createPettyCashRequest({
                ...formData,
                amount: Number(formData.amount),
            });
            setIsCreateModalOpen(false);
            setFormData({
                date: getTodayStr(),
                amount: "",
                category: "Office Supplies",
                purpose: "",
                receiptUrl: "",
                bankAccountDetails: "",
            });
            loadClaims();
        } catch (err) {
            alert(err.message || "Failed to submit claim");
        }
    };

    // Handle delete claim
    const handleDeleteClaim = async (id) => {
        if (!confirm("Are you sure you want to cancel this claim?")) return;
        try {
            await deletePettyCashRequest(id);
            setRequests((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            alert(err.message || "Failed to delete claim");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <span>Staff Petty Cash & Daily Reimbursements</span>
                        <Receipt className="w-6 h-6 text-indigo-600" />
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Submit daily out-of-pocket expenses for management approval and track payment disbursements.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Reimbursement Claim</span>
                </button>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Pending Admin Approval
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-bold text-amber-600">
                            ₦{summary.totalPending?.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            In Review
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Approved (Awaiting Payout)
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-bold text-blue-600">
                            ₦{summary.totalApproved?.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            Ready
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Total Reimbursed & Paid
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-bold text-emerald-600">
                            ₦{summary.totalReimbursed?.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Disbursed
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Total Claims Submitted
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-bold text-slate-900">
                            {summary.count} Claims
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            History
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs w-fit">
                {["all", "pending", "approved", "reimbursed", "denied"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                            statusFilter === s
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Claims Table / List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">
                        My Reimbursement Claims Roster
                    </h3>
                    <p className="text-xs text-slate-500">
                        Status of all expenses filed for reimbursement.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-xs">Loading claims...</div>
                ) : requests.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                        <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">No claims found</p>
                        <p className="text-xs text-slate-400">
                            Click "+ New Reimbursement Claim" to register a petty cash expenditure.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Purpose / Item</th>
                                    <th className="py-3 px-4">Receipt</th>
                                    <th className="py-3 px-4">Account Details</th>
                                    <th className="py-3 px-4 text-right">Amount (NGN)</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4">Admin Feedback</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((claim) => (
                                    <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                                            {claim.date}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                                                {claim.category}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                                            {claim.purpose}
                                        </td>
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            {claim.receiptUrl ? (
                                                <a
                                                    href={claim.receiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold text-[11px]"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>View Receipt</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-[11px]">None</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] max-w-[150px] truncate">
                                            {claim.bankAccountDetails || "On File"}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                                            ₦{claim.amount?.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            {claim.status === "pending" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Pending Review</span>
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
                                                    <span>Disbursed / Paid</span>
                                                </span>
                                            )}
                                            {claim.status === "denied" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <XCircle className="w-3 h-3" />
                                                    <span>Denied</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                                            {claim.adminNote ? (
                                                <span className="italic text-slate-700">
                                                    "{claim.adminNote}"
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            {claim.status === "pending" ? (
                                                <button
                                                    onClick={() => handleDeleteClaim(claim._id)}
                                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                                    title="Cancel claim"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Claim Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Submit Petty Cash Reimbursement
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Fill in the expense details for administrative approval.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitClaim} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Amount (NGN) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="e.g., 8500"
                                        value={formData.amount}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, amount: e.target.value }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Date Incurred
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, date: e.target.value }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Purpose / Detailed Description *
                                </label>
                                <textarea
                                    rows={2}
                                    required
                                    placeholder="e.g. Fuel for client site inspection in Ikeja chemical warehouse"
                                    value={formData.purpose}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, purpose: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Your Bank Account for Payout
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. GTBank - 0123456789 - John Doe"
                                    value={formData.bankAccountDetails}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            bankAccountDetails: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                                />
                            </div>

                            {/* Receipt File Upload */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Attach Receipt / Proof of Payment (Optional)
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>
                                            {uploadingReceipt ? "Uploading..." : "Upload Receipt Image / PDF"}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*,.pdf"
                                        />
                                    </label>
                                    {formData.receiptUrl && (
                                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Attached
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadingReceipt}
                                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                                >
                                    Submit Claim
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
