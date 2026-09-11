"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Sparkles,
    Search,
    GraduationCap,
    FileText,
    MessageSquare,
    PlusCircle,
    Flame,
    Award,
    ShieldCheck,
    Filter,
    Loader2,
    BookOpen,
    Users,
    TrendingUp,
    LogOut,
    UserCheck,
} from "lucide-react";
import CommunityCard from "@/components/community/CommunityCard";
import AuthModal from "@/components/community/AuthModal";
import { fetchCommunityPosts, toggleCommunityPostLike } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
    "All",
    "Industrial & Petrochemicals",
    "Pharmaceutical & Medicinal",
    "Cosmetics & Personal Care",
    "Green Chemistry & Circular Economy",
    "Agrochemicals & Fertilizers",
    "Polymers & Materials Science",
    "Process Engineering & Plant Ops",
    "General ChemTalk",
];

const TYPES = [
    { id: "all", label: "All Posts", icon: BookOpen },
    { id: "thesis", label: "Chemical Theses", icon: GraduationCap },
    { id: "article", label: "Industry Articles", icon: FileText },
    { id: "discussion", label: "Public Talks", icon: MessageSquare },
];

export default function ChemTalkPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedType, setSelectedType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");

    // Auth State
    const [currentUser, setCurrentUser] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState("login");

    // Load current community user
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
        const handleAuthChange = () => checkAuth();
        window.addEventListener("communityAuthChange", handleAuthChange);
        return () => window.removeEventListener("communityAuthChange", handleAuthChange);
    }, [checkAuth]);

    const handleSignOut = () => {
        localStorage.removeItem("communityToken");
        localStorage.removeItem("communityUser");
        setCurrentUser(null);
        window.dispatchEvent(new Event("communityAuthChange"));
        toast.info("Signed out of ChemTalk");
    };

    // Fetch Posts
    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchCommunityPosts({
                category: selectedCategory,
                type: selectedType,
                search: searchQuery,
                sort: sortBy,
            });
            setPosts(data.posts || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to load community posts:", err);
            toast.error("Failed to load discussions");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedType, searchQuery, sortBy]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleLikeToggle = async (postId) => {
        if (!currentUser) {
            setAuthModalMode("login");
            setAuthModalOpen(true);
            toast.info("Please sign in or register to like posts");
            return;
        }

        try {
            const result = await toggleCommunityPostLike(postId);
            setPosts((prev) =>
                prev.map((p) =>
                    p._id === postId
                        ? { ...p, likeCount: result.likeCount }
                        : p
                )
            );
        } catch (err) {
            toast.error(err.message || "Failed to like post");
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#f8fafc]">
            {/* ── Hero Banner ── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-20 border-b border-blue-900/50">
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-400/30 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            ChemTalk: The Chemical Agora
                        </div>
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
                            Public Talks, Theses & Chemical Discourse
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                            An open scientific exchange for chemical researchers, students, plant engineers, and industry analysts. Publish chemical theses, raise sub-topics, debate market trends, and participate in peer discourse.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={currentUser ? "/chemtalk/new" : "#"}
                                onClick={(e) => {
                                    if (!currentUser) {
                                        e.preventDefault();
                                        setAuthModalMode("register");
                                        setAuthModalOpen(true);
                                    }
                                }}
                                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl hover:shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Publish Thesis / Article
                            </Link>

                            {!currentUser && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthModalMode("register");
                                        setAuthModalOpen(true);
                                    }}
                                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Create Free Member Account
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Pill Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-white">{total || "24+"}</p>
                            <p className="text-xs text-blue-200 font-medium">Published Theses & Articles</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-amber-400">100%</p>
                            <p className="text-xs text-blue-200 font-medium">Open & Public Peer Access</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-emerald-400">8+</p>
                            <p className="text-xs text-blue-200 font-medium">Chemical Disciplines</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-purple-400">Live</p>
                            <p className="text-xs text-blue-200 font-medium">Threaded Sub-Topic Debates</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Main Hub Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                {/* Search and Filters Bar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Search Input */}
                        <div className="relative w-full md:w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search theses, topics, keywords or authors..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                            />
                        </div>

                        {/* Type Switcher */}
                        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                            {TYPES.map((t) => {
                                const Icon = t.icon;
                                const active = selectedType === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setSelectedType(t.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            active
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <span className="text-xs font-semibold text-slate-500">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="latest">Latest Published</option>
                                <option value="popular">Most Upvoted / Popular</option>
                                <option value="discussed">Most Active Threads</option>
                                <option value="theses">Theses First</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Chips Scroll */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                        <span className="text-[11px] font-bold uppercase text-slate-400 shrink-0">Topic:</span>
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                        isSelected
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── 2-Column Layout: Feed + Sidebar ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Feed Column (8 cols) */}
                    <main className="lg:col-span-8 space-y-6">
                        {loading ? (
                            <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                                <p className="text-sm font-semibold text-slate-500">Loading ChemTalk contributions...</p>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-5">
                                {posts.map((post) => (
                                    <CommunityCard
                                        key={post._id}
                                        post={post}
                                        onLikeToggle={handleLikeToggle}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-800 mb-1">No community topics found</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                                    Be the pioneering researcher or industry professional to publish a chemical thesis, project finding, or open a discussion thread here.
                                </p>
                                <Link
                                    href={currentUser ? "/chemtalk/new" : "#"}
                                    onClick={(e) => {
                                        if (!currentUser) {
                                            e.preventDefault();
                                            setAuthModalMode("register");
                                            setAuthModalOpen(true);
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow hover:bg-blue-700 transition-colors"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Publish the First Article or Thesis
                                </Link>
                            </div>
                        )}
                    </main>

                    {/* Sidebar Column (4 cols) */}
                    <aside className="lg:col-span-4 space-y-6">
                        {/* Member Status Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                            {currentUser ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                                            {currentUser.profilePhoto ? (
                                                <img src={currentUser.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span>{currentUser.fullName?.charAt(0) || currentUser.username?.charAt(0) || "U"}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-extrabold text-sm text-slate-900 truncate">
                                                    {currentUser.fullName || currentUser.username}
                                                </h4>
                                                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {currentUser.affiliation || "Member Chemist"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Reputation Score:</span>
                                        <span className="font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                                            🏅 {currentUser.reputation || 5} Rep
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Link
                                            href="/chemtalk/new"
                                            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs text-center transition-colors flex items-center justify-center gap-1 shadow-sm"
                                        >
                                            <PlusCircle className="w-3.5 h-3.5" />
                                            New Post
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs text-center transition-colors flex items-center justify-center gap-1"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-base text-slate-900">Join ChemTalk</h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Create your researcher account to write articles, publish your chemical thesis, and reply to community threads.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAuthModalMode("register");
                                                setAuthModalOpen(true);
                                            }}
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                                        >
                                            Create Account
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAuthModalMode("login");
                                                setAuthModalOpen(true);
                                            }}
                                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Peer Review Guidelines Card */}
                        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                <span>Academic & Discussion Standards</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                ChemTalk is dedicated to rigorous scientific and industry discourse. When publishing theses and comments:
                            </p>
                            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                                <li>Include clear chemical formulations & methodologies.</li>
                                <li>Acknowledge co-authors and academic institutions.</li>
                                <li>Maintain civil, evidence-based technical commentary.</li>
                                <li>Observe proprietary and patent disclosure guidelines.</li>
                            </ul>
                        </div>

                        {/* Trending Categories Spotlight */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span>Trending Chemical Domains</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { name: "Petrochemical Refining & Catalysts", count: "12 debates" },
                                    { name: "Bio-based Cosmetic Polymers", count: "8 theses" },
                                    { name: "Fertilizer Blending Formulations", count: "15 talks" },
                                    { name: "Green Hydrogen & Decarbonization", count: "9 papers" },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs">
                                        <span className="font-semibold text-slate-700">{item.name}</span>
                                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authModalMode}
                onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    loadPosts();
                }}
            />
        </div>
    );
}
