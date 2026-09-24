"use client";

import { useState, useEffect } from "react";
import { Check, Trash2, Loader2, MessageSquare, Mail, Phone, CornerDownRight, ExternalLink } from "lucide-react";
import { fetchPendingComments, approveComment, deleteComment } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function CommentsManagement() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const data = await fetchPendingComments();
            setComments(data);
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
            setComments(comments.filter(c => c._id !== id));
            toast.success("Comment approved and published");
        } catch (error) {
            toast.error("Failed to approve comment");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this comment? Any chained replies will also be removed.")) return;
        try {
            await deleteComment(id);
            setComments(comments.filter(c => c._id !== id));
            toast.success("Comment deleted");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Comments & Replies Moderation</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {comments.length} comment{comments.length !== 1 ? "s" : ""} pending review
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border">
                            <tr>
                                <th className="px-6 py-3.5">Author & Contact</th>
                                <th className="px-6 py-3.5">Type & Comment</th>
                                <th className="px-6 py-3.5">Article</th>
                                <th className="px-6 py-3.5">Date</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {comments.map((comment) => {
                                const isReply = Boolean(comment.parentId);
                                const replyTarget = comment.replyToAuthor || (comment.parentId && comment.parentId.authorName);

                                return (
                                    <tr key={comment._id} className="hover:bg-accent/40 transition-colors">
                                        {/* Author & Contact */}
                                        <td className="px-6 py-4 align-top">
                                            <div className="space-y-1">
                                                <div className="font-bold text-foreground">
                                                    {comment.authorName}
                                                </div>
                                                {comment.authorEmail && (
                                                    <a
                                                        href={`mailto:${comment.authorEmail}`}
                                                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                                                    >
                                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                                        <span>{comment.authorEmail}</span>
                                                    </a>
                                                )}
                                                {comment.authorPhone && (
                                                    <a
                                                        href={`tel:${comment.authorPhone}`}
                                                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline"
                                                    >
                                                        <Phone className="w-3 h-3 text-muted-foreground" />
                                                        <span>{comment.authorPhone}</span>
                                                    </a>
                                                )}
                                                {!comment.authorEmail && !comment.authorPhone && (
                                                    <span className="text-[11px] text-muted-foreground italic">
                                                        No contact provided
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Type & Comment Content */}
                                        <td className="px-6 py-4 max-w-md align-top space-y-1.5">
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
                                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                                {comment.content}
                                            </p>
                                        </td>

                                        {/* Post */}
                                        <td className="px-6 py-4 text-muted-foreground align-top max-w-xs">
                                            {comment.post ? (
                                                <span className="font-medium text-foreground line-clamp-2 text-xs">
                                                    {comment.post.title}
                                                </span>
                                            ) : (
                                                <span className="text-xs italic">Unknown Post</span>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap align-top">
                                            {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right space-x-1.5 align-top whitespace-nowrap">
                                            <button
                                                onClick={() => handleApprove(comment._id)}
                                                className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-bold transition-colors"
                                                title="Approve Comment"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Approve</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment._id)}
                                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                                                title="Delete Comment"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {comments.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-muted-foreground text-center">
                        <MessageSquare className="w-12 h-12 mb-3 text-muted-foreground/30" />
                        <h3 className="font-semibold text-foreground text-base">No pending comments</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            All user comments and threaded replies have been reviewed and published.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
