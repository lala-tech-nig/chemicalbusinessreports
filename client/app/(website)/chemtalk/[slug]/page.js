"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    GraduationCap,
    FileText,
    Building,
    MessageSquare,
    Heart,
    Share2,
    Calendar,
    Clock,
    Download,
    Send,
    Reply,
    Loader2,
    Sparkles,
    UserCheck,
    Check,
} from "lucide-react";
import AuthModal from "@/components/community/AuthModal";
import {
    fetchCommunityPost,
    toggleCommunityPostLike,
    fetchCommunityComments,
    createCommunityComment,
    toggleCommunityCommentLike,
} from "@/lib/api";
import { toast } from "sonner";

export default function SingleChemTalkPage({ params }) {
    const { slug } = use(params);

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);

    // Auth state
    const [currentUser, setCurrentUser] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState("login");

    // New top-level comment
    const [newCommentText, setNewCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Replying state (parentId of comment being replied to)
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);

    // Copied link state
    const [copied, setCopied] = useState(false);

    // Check user auth
    const checkAuth = useCallback(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("communityUser");
            if (stored) {
                try {
                    setCurrentUser(JSON.parse(stored));
                } catch {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
        }
    }, []);

    useEffect(() => {
        checkAuth();
        const handleAuth = () => checkAuth();
        window.addEventListener("communityAuthChange", handleAuth);
        return () => window.removeEventListener("communityAuthChange", handleAuth);
    }, [checkAuth]);

    // Load Post
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchCommunityPost(slug);
                setPost(data);
            } catch (err) {
                console.error("Failed to load post:", err);
                toast.error("Could not find this community article or thesis");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    // Load Threaded Comments
    const loadComments = useCallback(async () => {
        if (!post?._id) return;
        setLoadingComments(true);
        try {
            const data = await fetchCommunityComments(post._id);
            setComments(data.comments || []);
        } catch (err) {
            console.error("Failed to load comments:", err);
        } finally {
            setLoadingComments(false);
        }
    }, [post?._id]);

    useEffect(() => {
        if (post?._id) {
            loadComments();
        }
    }, [post?._id, loadComments]);

    // Like Post
    const handleLikePost = async () => {
        if (!currentUser) {
            setAuthModalMode("login");
            setAuthModalOpen(true);
            toast.info("Please sign in or register to like this post");
            return;
        }

        try {
            const res = await toggleCommunityPostLike(post._id);
            setPost((prev) => ({ ...prev, likeCount: res.likeCount }));
        } catch (err) {
            toast.error(err.message || "Failed to like post");
        }
    };

    // Like Comment
    const handleLikeComment = async (commentId) => {
        if (!currentUser) {
            setAuthModalMode("login");
            setAuthModalOpen(true);
            toast.info("Please sign in or register to upvote comments");
            return;
        }

        try {
            const res = await toggleCommunityCommentLike(commentId);
            // Update in comments tree
            setComments((prev) =>
                prev.map((c) => {
                    if (c._id === commentId) {
                        return { ...c, likeCount: res.likeCount };
                    }
                    if (c.replies && c.replies.length > 0) {
                        return {
                            ...c,
                            replies: c.replies.map((r) =>
                                r._id === commentId ? { ...r, likeCount: res.likeCount } : r
                            ),
                        };
                    }
                    return c;
                })
            );
        } catch (err) {
            toast.error("Failed to like comment");
        }
    };

    // Submit Top-Level Comment
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setAuthModalMode("login");
            setAuthModalOpen(true);
            return;
        }

        if (!newCommentText.trim()) return;

        setSubmittingComment(true);
        try {
            const newComment = await createCommunityComment(post._id, {
                content: newCommentText.trim(),
            });
            setComments((prev) => [newComment, ...prev]);
            setNewCommentText("");
            setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
            toast.success("Comment posted successfully!");
        } catch (err) {
            toast.error(err.message || "Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Submit Sub-Reply
    const handleSubmitReply = async (parentId) => {
        if (!currentUser) {
            setAuthModalMode("login");
            setAuthModalOpen(true);
            return;
        }

        if (!replyText.trim()) return;

        setSubmittingReply(true);
        try {
            const newReply = await createCommunityComment(post._id, {
                content: replyText.trim(),
                parentId,
            });

            // Nest inside parent comment in state
            setComments((prev) =>
                prev.map((c) => {
                    if (c._id === parentId) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), newReply],
                        };
                    }
                    return c;
                })
            );

            setReplyText("");
            setReplyingToId(null);
            setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
            toast.success("Sub-topic reply posted!");
        } catch (err) {
            toast.error(err.message || "Failed to post reply");
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-[#fafafa]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-[#fafafa]">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Topic or Thesis Not Found</h2>
                    <p className="text-sm text-slate-500 mb-6">This community publication may have been moved or removed.</p>
                    <Link
                        href="/chemtalk"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
                    >
                        Return to ChemTalk Hub
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20 bg-[#fafafa]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back to ChemTalk Link */}
                <Link
                    href="/chemtalk"
                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to ChemTalk
                </Link>

                {/* ── Main Article / Thesis Container ── */}
                <article className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/80 shadow-sm mb-10">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80">
                                {post.type === "thesis" ? (
                                    <>
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        Chemical Thesis
                                    </>
                                ) : post.type === "article" ? (
                                    <>
                                        <FileText className="w-3.5 h-3.5" />
                                        Industry Article
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Public Talk
                                    </>
                                )}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                {post.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                5 min read
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug mb-6">
                        {post.title}
                    </h1>

                    {/* Author Attribution Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 overflow-hidden">
                                {post.authorPhoto ? (
                                    <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{post.authorName?.charAt(0)?.toUpperCase() || "A"}</span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                                        {post.authorName}
                                    </h4>
                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-xs text-slate-600 font-medium">
                                    {post.authorAffiliation || "Independent Researcher"}
                                    {post.author?.fieldOfStudy && ` • ${post.author.fieldOfStudy}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                                🏅 {post.author?.reputation || 10} Rep
                            </span>
                        </div>
                    </div>

                    {/* Abstract / Executive Summary Callout (Academic style) */}
                    {post.abstract && (
                        <div className="mb-8 p-6 rounded-2xl bg-amber-50/60 border-l-4 border-amber-500 shadow-2xs">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                                    {post.type === "thesis" ? "Thesis Abstract" : "Executive Summary"}
                                </h3>
                            </div>
                            <p className="text-sm text-amber-950/90 leading-relaxed font-serif italic">
                                &ldquo;{post.abstract}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Featured Cover Image if any */}
                    {post.coverImage && (
                        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[500px]">
                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Full PDF Download Banner if thesis attachment exists */}
                    {post.attachmentUrl && (
                        <div className="mb-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-950">
                                        Full Research Document / Thesis PDF
                                    </h4>
                                    <p className="text-xs text-emerald-700">
                                        {post.attachmentName || "Download full publication manuscript & chemical data"}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={post.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center gap-2 shrink-0"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </a>
                        </div>
                    )}

                    {/* Full Body Content */}
                    <div className="prose prose-slate prose-lg max-w-none text-slate-800 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-bold text-slate-400">Tags:</span>
                            {post.tags.map((tag, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Engagement Actions Bar */}
                    <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleLikePost}
                                className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-2 transition-all group"
                            >
                                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Upvote ({post.likeCount || 0})</span>
                            </button>
                            <a
                                href="#comments"
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Discussion ({post.commentCount || 0})</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleShare}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 font-bold text-xs flex items-center gap-2 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                                <span>{copied ? "Link Copied!" : "Share"}</span>
                            </button>
                        </div>
                    </div>
                </article>

                {/* ── Threaded Comments & Sub-Topics Section ── */}
                <section id="comments" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                                Peer Review & Sub-Topics Discussion
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Join the thread, ask methodology questions, raise sub-topics, or reply to peers.
                            </p>
                        </div>
                        <span className="text-xs font-extrabold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {comments.length} Threads
                        </span>
                    </div>

                    {/* New Top-Level Comment Composer */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        {currentUser ? (
                            <form onSubmit={handleSubmitComment} className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                        {currentUser.fullName?.charAt(0) || "U"}
                                    </span>
                                    <span>Commenting as {currentUser.fullName || currentUser.username}</span>
                                </div>
                                <textarea
                                    rows={3}
                                    required
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Write your peer critique, question, or raise a new sub-topic..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-600 outline-none leading-relaxed"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !newCommentText.trim()}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        Post Peer Comment
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-4 space-y-2">
                                <p className="text-xs text-slate-600 font-medium">
                                    Sign in or register to join this discussion thread and reply to peer sub-topics.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthModalMode("login");
                                        setAuthModalOpen(true);
                                    }}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                                >
                                    Sign In to Comment
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Comments Thread Tree */}
                    <div className="space-y-6 pt-2">
                        {loadingComments ? (
                            <div className="py-12 text-center text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                                <span className="text-xs">Loading thread comments...</span>
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment._id} className="space-y-4">
                                    {/* Parent Comment */}
                                    <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 transition-colors shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                                                    {comment.authorName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-xs text-slate-900">
                                                        {comment.authorName}
                                                    </h5>
                                                    <p className="text-[11px] text-slate-500">
                                                        {comment.authorAffiliation || "Researcher"}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-slate-400">
                                                {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-700 leading-relaxed pl-10">
                                            {comment.content}
                                        </p>

                                        {/* Actions on comment */}
                                        <div className="flex items-center gap-4 pl-10 pt-1 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => handleLikeComment(comment._id)}
                                                className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-red-500 transition-colors"
                                            >
                                                <Heart className="w-3.5 h-3.5" />
                                                <span>{comment.likeCount || 0}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!currentUser) {
                                                        setAuthModalMode("login");
                                                        setAuthModalOpen(true);
                                                        return;
                                                    }
                                                    setReplyingToId(replyingToId === comment._id ? null : comment._id);
                                                    setReplyText("");
                                                }}
                                                className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <Reply className="w-3.5 h-3.5" />
                                                <span>Reply / Sub-topic</span>
                                            </button>
                                        </div>

                                        {/* Inline Sub-Reply Form */}
                                        {replyingToId === comment._id && (
                                            <div className="mt-3 ml-10 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                                                <p className="text-[11px] font-bold text-blue-900">
                                                    Reply to {comment.authorName}:
                                                </p>
                                                <textarea
                                                    rows={2}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your sub-reply or follow-up question..."
                                                    className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 bg-white outline-none focus:ring-2 focus:ring-blue-600"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReplyingToId(null)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={submittingReply || !replyText.trim()}
                                                        onClick={() => handleSubmitReply(comment._id)}
                                                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        {submittingReply ? "Posting..." : "Post Reply"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nested Sub-Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="ml-8 sm:ml-12 pl-4 border-l-2 border-blue-200/80 space-y-3">
                                            {comment.replies.map((reply) => (
                                                <div
                                                    key={reply._id}
                                                    className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                                                                {reply.authorName?.charAt(0) || "U"}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-xs text-slate-900 block leading-none">
                                                                    {reply.authorName}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500">
                                                                    {reply.authorAffiliation || "Participant"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(reply.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-700 leading-relaxed pl-8">
                                                        {reply.content}
                                                    </p>

                                                    <div className="pl-8 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleLikeComment(reply._id)}
                                                            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Heart className="w-3 h-3" />
                                                            <span>{reply.likeCount || 0}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-xs">
                                No comments yet on this topic. Be the first to share peer feedback or raise a sub-topic!
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authModalMode}
                onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    loadComments();
                }}
            />
        </div>
    );
}
