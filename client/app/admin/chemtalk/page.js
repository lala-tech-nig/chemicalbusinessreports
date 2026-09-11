"use client";

import { useState, useEffect, useCallback } from "react";
import {
    MessageSquare, FileText, Users, Search, Trash2,
    Flag, ShieldOff, ShieldCheck, Loader2, AlertTriangle,
    RefreshCw, GraduationCap, UserX, ChevronLeft,
    ChevronRight, CheckCircle, Eye,
} from "lucide-react";
import Link from "next/link";
import {
    adminFetchCommunityPosts,
    adminFetchCommunityComments,
    adminFetchCommunityUsers,
    adminDeleteCommunityPost,
    adminFlagCommunityPost,
    adminDeleteCommunityComment,
    adminToggleSuspendUser,
    adminDeleteCommunityUser,
} from "@/lib/api";
import { toast } from "sonner";

const TABS = [
    { id: "posts", label: "Posts & Theses", icon: FileText },
    { id: "comments", label: "Comments", icon: MessageSquare },
    { id: "members", label: "Members", icon: Users },
];

const TYPE_LABELS = {
    thesis: { label: "Thesis", color: "#7c3aed", bg: "#ede9fe" },
    article: { label: "Article", color: "#0369a1", bg: "#e0f2fe" },
    discussion: { label: "Discussion", color: "#0f766e", bg: "#ccfbf1" },
    "case-study": { label: "Case Study", color: "#b45309", bg: "#fef3c7" },
};

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Confirm Action</h3>
                </div>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── POSTS TAB ─────────────────────────────── */
function PostsTab() {
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminFetchCommunityPosts({ search, type: typeFilter, status: statusFilter, page });
            setPosts(data.posts || []);
            setTotal(data.total || 0);
        } catch (e) { toast.error(e.message); }
        finally { setLoading(false); }
    }, [search, typeFilter, statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = (post) => setConfirm({
        message: `Permanently delete "${post.title}" and ALL its comments? This cannot be undone.`,
        onConfirm: async () => {
            setActionLoading(true);
            try { await adminDeleteCommunityPost(post._id); toast.success("Post deleted"); setConfirm(null); load(); }
            catch (e) { toast.error(e.message); }
            finally { setActionLoading(false); }
        },
    });

    const handleFlag = async (post) => {
        try { const res = await adminFlagCommunityPost(post._id); toast.success(res.message); load(); }
        catch (e) { toast.error(e.message); }
    };

    const totalPages = Math.ceil(total / 30);

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search title or author..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 focus:bg-white" />
                </div>
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium text-slate-700 outline-none">
                    <option value="all">All Types</option>
                    <option value="thesis">Thesis</option>
                    <option value="article">Article</option>
                    <option value="discussion">Discussion</option>
                    <option value="case-study">Case Study</option>
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium text-slate-700 outline-none">
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="flagged">Flagged</option>
                </select>
                <button onClick={load} className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">{total} posts total</p>

            {loading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></div>
            ) : posts.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No posts found.</div>
            ) : (
                <div className="space-y-3">
                    {posts.map(post => {
                        const ti = TYPE_LABELS[post.type] || { label: post.type, color: "#475569", bg: "#f1f5f9" };
                        return (
                            <div key={post._id}
                                className={`bg-white border rounded-2xl p-4 flex flex-wrap items-start gap-4 ${post.status === "flagged" ? "border-orange-300 bg-orange-50/30" : "border-slate-200"}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: ti.color, background: ti.bg }}>{ti.label}</span>
                                        {post.status === "flagged" && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">⚠ Flagged</span>
                                        )}
                                        <span className="text-[11px] text-slate-400">{post.category}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm truncate mb-1">{post.title}</h4>
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                        <span>by <strong className="text-slate-700">{post.authorName}</strong></span>
                                        <span>👍 {post.likeCount}</span>
                                        <span>💬 {post.commentCount}</span>
                                        <span>👁 {post.views}</span>
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href={`/chemtalk/${post.slug}`} target="_blank"
                                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" title="View post">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleFlag(post)}
                                        className={`p-2 rounded-xl transition-colors ${post.status === "flagged" ? "bg-green-100 hover:bg-green-200 text-green-700" : "bg-orange-100 hover:bg-orange-200 text-orange-700"}`}
                                        title={post.status === "flagged" ? "Restore post" : "Flag post"}>
                                        {post.status === "flagged" ? <CheckCircle className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleDelete(post)}
                                        className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors" title="Delete post">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm text-slate-600 font-medium">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                </div>
            )}
            {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} loading={actionLoading} />}
        </div>
    );
}

/* ── COMMENTS TAB ──────────────────────────── */
function CommentsTab() {
    const [comments, setComments] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminFetchCommunityComments({ search, page });
            setComments(data.comments || []);
            setTotal(data.total || 0);
        } catch (e) { toast.error(e.message); }
        finally { setLoading(false); }
    }, [search, page]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = (comment) => setConfirm({
        message: `Delete this comment by "${comment.authorName}"? All replies will also be removed.`,
        onConfirm: async () => {
            setActionLoading(true);
            try { await adminDeleteCommunityComment(comment._id); toast.success("Comment deleted"); setConfirm(null); load(); }
            catch (e) { toast.error(e.message); }
            finally { setActionLoading(false); }
        },
    });

    const totalPages = Math.ceil(total / 40);

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search comment or author..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 focus:bg-white" />
                </div>
                <button onClick={load} className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">{total} comments total</p>

            {loading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></div>
            ) : comments.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No comments found.</div>
            ) : (
                <div className="space-y-3">
                    {comments.map(comment => (
                        <div key={comment._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-slate-900">{comment.authorName}</span>
                                    {comment.parentId && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Reply</span>
                                    )}
                                    <span className="text-[11px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-1.5">{comment.content}</p>
                                {comment.postId && (
                                    <Link href={`/chemtalk/${comment.postId.slug}`} target="_blank"
                                        className="text-[11px] text-blue-600 hover:underline font-medium">
                                        → on: {comment.postId.title}
                                    </Link>
                                )}
                            </div>
                            <button onClick={() => handleDelete(comment)}
                                className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors shrink-0" title="Delete comment">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm text-slate-600 font-medium">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                </div>
            )}
            {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} loading={actionLoading} />}
        </div>
    );
}

/* ── MEMBERS TAB ───────────────────────────── */
function MembersTab() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminFetchCommunityUsers({ search, page });
            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch (e) { toast.error(e.message); }
        finally { setLoading(false); }
    }, [search, page]);

    useEffect(() => { load(); }, [load]);

    const handleSuspend = async (user) => {
        try { const res = await adminToggleSuspendUser(user._id); toast.success(res.message); load(); }
        catch (e) { toast.error(e.message); }
    };

    const handleDelete = (user) => setConfirm({
        message: `Permanently delete "${user.username}"? All their posts and comments will be removed. This cannot be undone.`,
        onConfirm: async () => {
            setActionLoading(true);
            try { await adminDeleteCommunityUser(user._id); toast.success("User deleted"); setConfirm(null); load(); }
            catch (e) { toast.error(e.message); }
            finally { setActionLoading(false); }
        },
    });

    const totalPages = Math.ceil(total / 40);

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search username, name or email..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 focus:bg-white" />
                </div>
                <button onClick={load} className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">{total} members total</p>

            {loading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></div>
            ) : users.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No members found.</div>
            ) : (
                <div className="space-y-3">
                    {users.map(user => (
                        <div key={user._id}
                            className={`bg-white border rounded-2xl p-4 flex flex-wrap items-center gap-4 ${!user.isActive ? "border-red-200 bg-red-50/20" : "border-slate-200"}`}>
                            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                                {user.profilePhoto
                                    ? <img src={user.profilePhoto} alt={user.username} className="w-full h-full object-cover" />
                                    : <span>{(user.fullName || user.username)?.charAt(0)?.toUpperCase()}</span>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <span className="font-bold text-slate-900 text-sm">{user.fullName || user.username}</span>
                                    <span className="text-[11px] text-slate-500">@{user.username}</span>
                                    {!user.isActive && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">Suspended</span>
                                    )}
                                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        🏅 {user.reputation || 0} Rep
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                {user.affiliation && <p className="text-[11px] text-slate-400 truncate">{user.affiliation}</p>}
                                <p className="text-[11px] text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => handleSuspend(user)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${user.isActive
                                        ? "bg-orange-100 hover:bg-orange-200 text-orange-700"
                                        : "bg-green-100 hover:bg-green-200 text-green-700"}`}>
                                    {user.isActive ? <><ShieldOff className="w-3.5 h-3.5" /> Suspend</> : <><ShieldCheck className="w-3.5 h-3.5" /> Reinstate</>}
                                </button>
                                <button onClick={() => handleDelete(user)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold transition-colors">
                                    <UserX className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm text-slate-600 font-medium">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                </div>
            )}
            {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} loading={actionLoading} />}
        </div>
    );
}

/* ── MAIN PAGE ─────────────────────────────── */
export default function AdminChemTalkPage() {
    const [activeTab, setActiveTab] = useState("posts");
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="bg-slate-900 text-white px-6 py-8 mb-8">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">ChemTalk Moderation</h1>
                        <p className="text-slate-400 text-xs">Manage posts, comments, and community members</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
                <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-6 shadow-sm w-fit">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    {activeTab === "posts" && <PostsTab />}
                    {activeTab === "comments" && <CommentsTab />}
                    {activeTab === "members" && <MembersTab />}
                </div>
            </div>
        </div>
    );
}

