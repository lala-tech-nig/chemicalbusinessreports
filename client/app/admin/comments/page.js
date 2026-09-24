"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Trash2, Loader2, MessageSquare, Mail, Phone, CornerDownRight, ExternalLink, Search, Filter, X, AlertTriangle } from "lucide-react";
import { fetchAllComments, approveComment, deleteComment } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function CommentsManagement() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "approved"
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const data = await fetchAllComments();
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load comments", error);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveComment(id);
            setComments(prev =>
                prev.map(c => (c._id === id ? { ...c, isApproved: true } : c))
            );
            toast.success("Comment approved and published");
        } catch (error) {
            toast.error("Failed to approve comment");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this comment? Any chained replies will also be permanently removed from the platform.")) {
            return;
        }

        setDeletingId(id);
        try {
            await deleteComment(id);
            // Remove deleted comment and any comments having it as parentId
            setComments(prev => prev.filter(c => c._id !== id && c.parentId !== id));
            toast.success("Comment and any chained replies permanently deleted");
        } catch (error) {
            toast.error(error.message || "Failed to delete comment");
        } finally {
            setDeletingId(null);
        }
    };

    // Filtered comments
    const filteredComments = useMemo(() => {
        return comments.filter(c => {
            // Status filter
            if (statusFilter === "pending" && c.isApproved) return false;
            if (statusFilter === "approved" && !c.isApproved) return false;

            // Search query
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const postTitle = c.post?.title || "";
                const author = c.authorName || "";
                const email = c.authorEmail || "";
                const phone = c.authorPhone || "";
                const content = c.content || "";
                const replyTo = c.replyToAuthor || "";

                const match =
                    author.toLowerCase().includes(q) ||
                    email.toLowerCase().includes(q) ||
                    phone.toLowerCase().includes(q) ||
                    content.toLowerCase().includes(q) ||
                    replyTo.toLowerCase().includes(q) ||
                    postTitle.toLowerCase().includes(q);

                if (!match) return false;
            }

            return true;
        });
    }, [comments, statusFilter, searchTerm]);

    const pendingCount = comments.filter(c => !c.isApproved).length;
    const approvedCount = comments.filter(c => c.isApproved).length;

    if (loading) {
        return (
            <div className="flex justify-center p-16">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Comments & Replies Moderation</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage, review, or delete any comment across the platform ({comments.length} total)
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl text-xs font-semibold overflow-x-auto">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                statusFilter === "all"
                                    ? "bg-background text-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All ({comments.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter("pending")}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                statusFilter === "pending"
                                    ? "bg-amber-500 text-white shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span>Pending</span>
                            {pendingCount > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${statusFilter === "pending" ? "bg-white/30" : "bg-amber-100 text-amber-800"}`}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setStatusFilter("approved")}
                            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                statusFilter === "approved"
                                    ? "bg-green-600 text-white shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Approved ({approvedCount})
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by author, email, content, article..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border">
                            <tr>
                                <th className="px-5 py-3.5">Author & Contact</th>
                                <th className="px-5 py-3.5">Type & Message</th>
                                <th className="px-5 py-3.5">Article</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredComments.map((comment) => {
                                const isReply = Boolean(comment.parentId);
                                const replyTarget = comment.replyToAuthor || (comment.parentId && comment.parentId.authorName);
                                const isBeingDeleted = deletingId === comment._id;

                                return (
                                    <tr key={comment._id} className="hover:bg-accent/40 transition-colors">
                                        {/* Author & Contact */}
                                        <td className="px-5 py-4 align-top whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="font-bold text-foreground">
                                                    {comment.authorName}
                                                </div>
                                                {comment.authorEmail && (
                                                    <a
                                                        href={`mailto:${comment.authorEmail}`}
                                                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                                                    >
                                                        <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                                                        <span>{comment.authorEmail}</span>
                                                    </a>
                                                )}
                                                {comment.authorPhone && (
                                                    <a
                                                        href={`tel:${comment.authorPhone}`}
                                                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline"
                                                    >
                                                        <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                                                        <span>{comment.authorPhone}</span>
                                                    </a>
                                                )}
                                                {!comment.authorEmail && !comment.authorPhone && (
                                                    <span className="text-[11px] text-muted-foreground italic">
                                                        No contact
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Type & Comment Content */}
                                        <td className="px-5 py-4 max-w-sm sm:max-w-md align-top space-y-1.5">
                                            {isReply ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                    <CornerDownRight className="w-3 h-3" />
                                                    Reply to @{replyTarget || "Comment"}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Direct Comment
                                                </span>
                                            )}
                                            <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                                                {comment.content}
                                            </p>
                                        </td>

                                        {/* Post */}
                                        <td className="px-5 py-4 text-muted-foreground align-top max-w-xs">
                                            {comment.post ? (
                                                <div className="space-y-1">
                                                    <span className="font-medium text-foreground line-clamp-2 text-xs">
                                                        {comment.post.title}
                                                    </span>
                                                    {comment.post.slug && (
                                                        <Link
                                                            href={`/posts/${comment.post.slug}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                                                        >
                                                            <span>View live post</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs italic">Unknown Post</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4 align-top whitespace-nowrap">
                                            {comment.isApproved ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-4 text-muted-foreground text-xs whitespace-nowrap align-top">
                                            {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>

                                        {/* Actions: Approve (if pending) & Delete (ALWAYS available) */}
                                        <td className="px-5 py-4 text-right space-x-1.5 align-top whitespace-nowrap">
                                            {!comment.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(comment._id)}
                                                    className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-bold transition-colors shadow-xs"
                                                    title="Approve Comment"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Approve</span>
                                                </button>
                                            )}

                                            {/* Admin can delete ANY comment on the entire platform */}
                                            <button
                                                onClick={() => handleDelete(comment._id)}
                                                disabled={isBeingDeleted}
                                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
                                                title="Permanently delete comment and all chained replies"
                                            >
                                                {isBeingDeleted ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredComments.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-muted-foreground text-center">
                        <MessageSquare className="w-12 h-12 mb-3 text-muted-foreground/30" />
                        <h3 className="font-semibold text-foreground text-base">No comments found</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            {searchTerm || statusFilter !== "all"
                                ? "No comments match your search criteria or filter."
                                : "There are currently no comments or replies on any article."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
