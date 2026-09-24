"use client";

import { useState, useMemo } from "react";
import { Loader2, MessageSquare, CornerDownRight, X, Mail, Phone, User, Check, Send } from "lucide-react";
import { createComment } from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";

/**
 * Builds a nested hierarchical tree from a flat list of comments.
 * Supports arbitrary depth: reply -> reply to reply -> reply to reply to reply...
 */
function buildCommentTree(flatComments) {
    if (!Array.isArray(flatComments)) return [];

    const map = new Map();
    const roots = [];

    // First pass: index all comments with an empty replies array
    flatComments.forEach(comment => {
        map.set(comment._id, { ...comment, replies: [] });
    });

    // Second pass: attach children to parents or push to roots
    flatComments.forEach(comment => {
        const item = map.get(comment._id);
        if (comment.parentId && map.has(comment.parentId)) {
            map.get(comment.parentId).replies.push(item);
        } else {
            roots.push(item);
        }
    });

    return roots;
}

// Generate a deterministic soft pastel background color from an author name
function getAvatarBg(name = "") {
    const colors = [
        "bg-blue-100 text-blue-700 border-blue-200",
        "bg-emerald-100 text-emerald-700 border-emerald-200",
        "bg-amber-100 text-amber-700 border-amber-200",
        "bg-purple-100 text-purple-700 border-purple-200",
        "bg-rose-100 text-rose-700 border-rose-200",
        "bg-indigo-100 text-indigo-700 border-indigo-200",
        "bg-teal-100 text-teal-700 border-teal-200",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Recursive Comment Item supporting infinite chained replies.
 */
function CommentItem({
    comment,
    postId,
    depth = 0,
    activeReplyId,
    setActiveReplyId,
    onSuccess,
}) {
    const isReplying = activeReplyId === comment._id;
    const [submitting, setSubmitting] = useState(false);
    const [replyForm, setReplyForm] = useState({
        authorName: "",
        authorEmail: "",
        authorPhone: "",
        content: "",
    });

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyForm.authorName.trim() || !replyForm.content.trim()) {
            toast.error("Please enter your name and message");
            return;
        }

        setSubmitting(true);
        try {
            await createComment({
                postId,
                parentId: comment._id,
                replyToAuthor: comment.authorName,
                authorName: replyForm.authorName.trim(),
                authorEmail: replyForm.authorEmail.trim(),
                authorPhone: replyForm.authorPhone.trim(),
                content: replyForm.content.trim(),
            });

            toast.success("Reply submitted for moderation. It will appear once approved!");
            confetti({
                particleCount: 45,
                spread: 50,
                origin: { y: 0.7 },
            });

            setReplyForm({
                authorName: "",
                authorEmail: "",
                authorPhone: "",
                content: "",
            });
            setActiveReplyId(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err.message || "Failed to submit reply");
        } finally {
            setSubmitting(false);
        }
    };

    const avatarStyles = getAvatarBg(comment.authorName);
    const initial = (comment.authorName || "U").charAt(0).toUpperCase();

    // Prevent excessive indentation on deep chains on mobile
    const indentPadding = depth > 4 ? "pl-2 sm:pl-3" : "pl-3 sm:pl-5";

    return (
        <div id={`comment-${comment._id}`} className="group relative">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm border shadow-xs ${avatarStyles}`}
                        >
                            {initial}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {comment.authorName}
                                </h4>
                                {comment.replyToAuthor && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        ↩ replying to @{comment.replyToAuthor}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium">
                                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Reply Action Button */}
                    <button
                        onClick={() => setActiveReplyId(isReplying ? null : comment._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isReplying
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "text-primary hover:bg-primary/10"
                        }`}
                        title={`Reply to ${comment.authorName}`}
                    >
                        {isReplying ? (
                            <>
                                <X className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <CornerDownRight className="w-3.5 h-3.5" />
                                <span>Reply</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Comment Content */}
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line pl-12 sm:pl-13">
                    {comment.content}
                </p>

                {/* Inline Reply Form */}
                {isReplying && (
                    <form
                        onSubmit={handleReplySubmit}
                        className="mt-4 pt-4 border-t border-gray-100 pl-3 sm:pl-6 space-y-3 bg-gray-50/70 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                <CornerDownRight className="w-3.5 h-3.5 text-primary" />
                                Replying to <span className="text-primary font-bold">@{comment.authorName}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setActiveReplyId(null)}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Name + Optional Email + Optional Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="eg. Jane Doe"
                                    value={replyForm.authorName}
                                    onChange={(e) => setReplyForm({ ...replyForm, authorName: e.target.value })}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                    Email <span className="text-[10px] text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={replyForm.authorEmail}
                                    onChange={(e) => setReplyForm({ ...replyForm, authorEmail: e.target.value })}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                    Phone <span className="text-[10px] text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+234..."
                                    value={replyForm.authorPhone}
                                    onChange={(e) => setReplyForm({ ...replyForm, authorPhone: e.target.value })}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                Reply Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows="3"
                                placeholder={`Write your reply to ${comment.authorName}...`}
                                value={replyForm.content}
                                onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setActiveReplyId(null)}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Posting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3 h-3" />
                                        <span>Post Reply</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Chained Recursive Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div
                    className={`mt-3 ml-2 sm:ml-4 border-l-2 border-primary/20 space-y-3 ${indentPadding}`}
                >
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            postId={postId}
                            depth={depth + 1}
                            activeReplyId={activeReplyId}
                            setActiveReplyId={setActiveReplyId}
                            onSuccess={onSuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Main Threaded Comments Component for Articles.
 */
export default function CommentSection({
    postId,
    comments = [],
    onCommentSubmitted,
}) {
    const [submitting, setSubmitting] = useState(false);
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [commentForm, setCommentForm] = useState({
        authorName: "",
        authorEmail: "",
        authorPhone: "",
        content: "",
    });

    // Build hierarchical tree from flat comments
    const commentTree = useMemo(() => {
        return buildCommentTree(comments);
    }, [comments]);

    const handleMainSubmit = async (e) => {
        e.preventDefault();
        if (!postId) return;
        if (!commentForm.authorName.trim() || !commentForm.content.trim()) {
            toast.error("Please enter your name and comment");
            return;
        }

        setSubmitting(true);
        try {
            await createComment({
                postId,
                authorName: commentForm.authorName.trim(),
                authorEmail: commentForm.authorEmail.trim(),
                authorPhone: commentForm.authorPhone.trim(),
                content: commentForm.content.trim(),
            });

            toast.success("Comment submitted for moderation. It will appear after approval.");
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.7 },
            });

            setCommentForm({
                authorName: "",
                authorEmail: "",
                authorPhone: "",
                content: "",
            });

            if (onCommentSubmitted) onCommentSubmitted();
        } catch (error) {
            toast.error(error.message || "Failed to submit comment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border-t border-gray-200 pt-16">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Conversations{" "}
                        <span className="text-gray-400 font-normal text-xl sm:text-2xl">
                            ({comments.length})
                        </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Join the dialogue, share insights, or reply to existing remarks.
                    </p>
                </div>
            </div>

            {/* Top-Level Comment Form */}
            <form
                onSubmit={handleMainSubmit}
                className="mb-14 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Join the discussion</h3>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Name, Email, Phone Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Name (Required) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="eg. John Doe"
                                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    value={commentForm.authorName}
                                    onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Email (Optional) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Email <span className="text-[11px] font-normal text-gray-400">(optional)</span>
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    value={commentForm.authorEmail}
                                    onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Phone (Optional) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Phone <span className="text-[11px] font-normal text-gray-400">(optional)</span>
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    placeholder="+234..."
                                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    value={commentForm.authorPhone}
                                    onChange={(e) => setCommentForm({ ...commentForm, authorPhone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message Area */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows="4"
                            placeholder="What are your thoughts on this chemical industry report?"
                            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                            value={commentForm.content}
                            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/20"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Posting Comment...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>Post Comment</span>
                        </>
                    )}
                </button>
            </form>

            {/* Comments Thread List */}
            <div className="space-y-6">
                {commentTree.map((rootComment) => (
                    <CommentItem
                        key={rootComment._id}
                        comment={rootComment}
                        postId={postId}
                        depth={0}
                        activeReplyId={activeReplyId}
                        setActiveReplyId={setActiveReplyId}
                        onSuccess={onCommentSubmitted}
                    />
                ))}

                {comments.length === 0 && (
                    <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-gray-200 p-8">
                        <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <h4 className="font-bold text-gray-700 text-base">No comments yet</h4>
                        <p className="text-gray-400 text-sm mt-1">
                            Be the first to share your thoughts and start the conversation!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
