"use client";

import { useState, useEffect, useMemo } from "react";
import { Edit, Trash2, Star, Loader2, User, FileX2, AlertTriangle, Share2, Search, Filter, X, Check } from "lucide-react";
import Link from "next/link";
import { fetchPosts, deletePost, setStoryOfTheDay, deleteAllDraftPosts } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
    "All",
    "News Roundup",
    "Chemical Mart",
    "Research & Reports",
    "Corporate Profile",
    "Start Up",
    "Services",
    "Executive Brief",
];

const STATUS_OPTIONS = ["All", "Published", "Draft", "Scheduled"];

export default function PostsList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("admin");
    const [deletingDrafts, setDeletingDrafts] = useState(false);
    const [showDraftConfirm, setShowDraftConfirm] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem("adminRole");
        if (storedRole) setRole(storedRole);
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await fetchPosts("All", "", "", "all");
            setPosts(data);
        } catch (error) {
            console.error("Failed to load posts", error);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePost(id);
            setPosts(posts.filter(p => p._id !== id));
            toast.success("Post deleted successfully");
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    const handleSetStory = async (id) => {
        try {
            await setStoryOfTheDay(id);
            loadPosts();
            toast.success("Story of the Day updated");
        } catch (error) {
            toast.error("Failed to update story setting");
        }
    };

    const handleDeleteAllDrafts = async () => {
        setDeletingDrafts(true);
        try {
            const result = await deleteAllDraftPosts();
            setPosts(prev => prev.filter(p => p.status !== "draft"));
            toast.success(result.message || "All drafts deleted.");
        } catch (error) {
            toast.error(error.message || "Failed to delete drafts");
        } finally {
            setDeletingDrafts(false);
            setShowDraftConfirm(false);
        }
    };

    const handleShare = (slug) => {
        const url = `https://chemicalbusinessreports.net/posts/${slug}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(slug);
            toast.success("Live link copied to clipboard!", { duration: 2000 });
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(() => toast.error("Failed to copy link"));
    };

    // Filtered + searched posts (client-side since all posts are loaded)
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // Category filter
            if (filterCategory !== "All" && post.category !== filterCategory) return false;

            // Status filter
            if (filterStatus !== "All") {
                const pStatus = post.status || "published";
                if (filterStatus === "Published" && pStatus !== "published" && pStatus !== "") return false;
                if (filterStatus === "Draft" && pStatus !== "draft") return false;
                if (filterStatus === "Scheduled" && pStatus !== "scheduled") return false;
            }

            // Full-text search across title, excerpt, content, author, category
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const searchable = [
                    post.title,
                    post.excerpt,
                    post.author,
                    post.category,
                    post.content?.replace(/<[^>]*>/g, "") || "",
                ].join(" ").toLowerCase();
                if (!searchable.includes(q)) return false;
            }

            return true;
        });
    }, [posts, searchTerm, filterCategory, filterStatus]);

    if (loading) return (
        <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    const draftCount = posts.filter(p => p.status === "draft").length;
    const activeFilters = (filterCategory !== "All" ? 1 : 0) + (filterStatus !== "All" ? 1 : 0) + (searchTerm ? 1 : 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">All Posts</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {filteredPosts.length} of {posts.length} posts
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {role === "admin" && draftCount > 0 && (
                        <button
                            id="delete-all-drafts-btn"
                            onClick={() => setShowDraftConfirm(true)}
                            disabled={deletingDrafts}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            title="Permanently delete all draft posts"
                        >
                            <FileX2 className="w-4 h-4 text-amber-600" />
                            <span>Delete All Drafts</span>
                            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold flex items-center justify-center">
                                {draftCount}
                            </span>
                        </button>
                    )}
                    <Link
                        href="/admin/create-post"
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Create New
                    </Link>
                </div>
            </div>

            {/* Search + Filter Bar */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                    {/* Search Box */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by title, content, author..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilterPanel(p => !p)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                            activeFilters > 0
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-input text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                        {activeFilters > 0 && (
                            <span className="w-5 h-5 rounded-full bg-white/30 text-[11px] font-bold flex items-center justify-center">
                                {activeFilters}
                            </span>
                        )}
                    </button>
                </div>

                {/* Expandable Filter Panel */}
                <AnimatePresence>
                    {showFilterPanel && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 border-t border-border space-y-3">
                                {/* Category Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setFilterCategory(cat)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                                    filterCategory === cat
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-background border-input text-muted-foreground hover:border-primary/50"
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTIONS.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setFilterStatus(s)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                                    filterStatus === s
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-background border-input text-muted-foreground hover:border-primary/50"
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Clear All */}
                                {activeFilters > 0 && (
                                    <button
                                        onClick={() => { setFilterCategory("All"); setFilterStatus("All"); setSearchTerm(""); }}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> Clear all filters
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Confirmation Modal */}
            {showDraftConfirm && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0 mt-0.5">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Delete All Drafts?</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    This will permanently delete{" "}
                                    <span className="font-bold text-amber-700">
                                        {draftCount} draft post{draftCount !== 1 ? "s" : ""}
                                    </span>
                                    . This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                onClick={() => setShowDraftConfirm(false)}
                                disabled={deletingDrafts}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-delete-drafts-btn"
                                onClick={handleDeleteAllDrafts}
                                disabled={deletingDrafts}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-60"
                            >
                                {deletingDrafts ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>
                                    {deletingDrafts
                                        ? "Deleting..."
                                        : `Yes, Delete ${draftCount} Draft${draftCount !== 1 ? "s" : ""}`}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-accent/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 w-8"></th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Author</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                        {searchTerm || filterCategory !== "All" || filterStatus !== "All"
                                            ? "No posts match your search/filter."
                                            : "No posts found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr
                                        key={post._id}
                                        className="bg-card hover:bg-accent/50 transition-colors border-b border-border last:border-0"
                                    >
                                        {/* Share Button — in front of each row */}
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleShare(post.slug)}
                                                title="Copy live link to clipboard"
                                                className={`p-1.5 rounded-lg transition-all ${
                                                    copiedId === post.slug
                                                        ? "bg-green-100 text-green-600"
                                                        : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                }`}
                                            >
                                                {copiedId === post.slug ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Share2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </td>

                                        <td className="px-4 py-4 font-medium max-w-xs">
                                            <div className="flex items-center gap-2">
                                                {post.isStoryOfTheDay && (
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                                )}
                                                <span className="line-clamp-2 text-sm">{post.title}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
                                                {post.category}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border shrink-0">
                                                    {post.authorPhoto ? (
                                                        <img
                                                            src={post.authorPhoto}
                                                            alt={post.author}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-3 h-3 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium truncate max-w-[100px]">
                                                    {post.author}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {(post.status === "published" || !post.status || post.status === "") && (
                                                <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                                    Published
                                                </span>
                                            )}
                                            {post.status === "draft" && (
                                                <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800">
                                                    Draft
                                                </span>
                                            )}
                                            {post.status === "scheduled" && (
                                                <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                                                    Scheduled
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground whitespace-nowrap text-xs">
                                            {post.status === "scheduled" && post.scheduledPublishDate ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-semibold text-blue-600">Goes live:</span>
                                                    <span>
                                                        {new Date(post.scheduledPublishDate).toLocaleString("en-NG", {
                                                            timeZone: "Africa/Lagos",
                                                        })}
                                                    </span>
                                                </div>
                                            ) : (
                                                new Date(post.createdAt).toLocaleDateString()
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-right space-x-1">
                                            {role === "admin" && (
                                                <>
                                                    <button
                                                        onClick={() => handleSetStory(post._id)}
                                                        className={`p-1.5 rounded-lg transition-colors ${
                                                            post.isStoryOfTheDay
                                                                ? "text-yellow-500"
                                                                : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                                                        }`}
                                                        title="Set as Story of the Day"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/admin/posts/${post._id}`}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors inline-block rounded-lg"
                                                        title="Edit Post"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post._id)}
                                                        className="p-1.5 hover:text-destructive hover:bg-red-50 transition-colors rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
