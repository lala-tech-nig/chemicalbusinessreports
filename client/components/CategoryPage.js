"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import ChemicalMartCard from "@/components/ChemicalMartCard";
import InFeedAd from "@/components/InFeedAd";
import { Search, Loader2, Clock, ArrowRight, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPosts, fetchActiveAds } from "@/lib/api";

function getAdSizeClasses(adSize) {
    switch (adSize) {
        case "2x1": return "col-span-2 row-span-1";
        case "1x2": return "col-span-1 row-span-2";
        case "2x2": return "col-span-2 row-span-2";
        case "3x1": return "col-span-2 md:col-span-3 row-span-1";
        case "1x3": return "col-span-1 row-span-3";
        case "1x1":
        default: return "col-span-1 row-span-1";
    }
}

export default function CategoryPage({ categoryName, description, subcategoryName, hideFeatured = false, categoryFilters = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [posts, setPosts] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const effectiveSubcategory = subcategoryName || (activeFilter !== "All" ? activeFilter : "");

    useEffect(() => {
        const timer = setTimeout(() => loadData(), 400);
        return () => clearTimeout(timer);
    }, [searchTerm, categoryName, subcategoryName, activeFilter]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [postsData, adsData] = await Promise.all([
                fetchPosts(categoryName, searchTerm, effectiveSubcategory),
                fetchActiveAds()
            ]);
            setPosts(postsData);
            setAds(adsData);
        } catch (err) {
            setError("Failed to load content. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getCombinedItems = () => {
        const combined = [];
        let adIndex = 0;
        posts.forEach((post, index) => {
            combined.push({ type: "post", data: post });
            if ((index + 1) % 4 === 0 && ads.length > 0) {
                combined.push({ type: "ad", data: ads[adIndex % ads.length] });
                adIndex++;
            }
        });
        return combined;
    };

    const combinedItems = getCombinedItems();
    const featuredPost = posts.find(p => p.isStoryOfTheDay) || posts[0];

    const allFilters = categoryFilters.length > 0 ? ["All", ...categoryFilters] : [];

    return (
        <div className="min-h-screen bg-white">
            {/* Category Banner */}
            <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 pt-28 pb-14 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">
                            Chemical Business Reports
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                            {categoryName}
                        </h1>
                        {description && (
                            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Sticky Search + Filter Bar */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
                    {/* Search Row */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${categoryName}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all"
                            />
                        </div>
                        <span className="text-sm text-gray-500 hidden sm:block">
                            {loading ? "Loading…" : `${posts.length} article${posts.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {/* Category Filter Pills */}
                    {allFilters.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            {allFilters.map((filter) => {
                                const isActive = activeFilter === filter;
                                return (
                                    <motion.button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        whileTap={{ scale: 0.95 }}
                                        className={[
                                            "relative flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap select-none border",
                                            isActive
                                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
                                        ].join(" ")}
                                    >
                                        {filter}
                                        {isActive && (
                                            <motion.span
                                                layoutId={`filter-pill-${categoryName}`}
                                                className="absolute inset-0 rounded-full bg-blue-600 -z-10"
                                                transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Featured Post */}
                {!searchTerm && activeFilter === "All" && featuredPost && !loading && !hideFeatured && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 relative group overflow-hidden rounded-3xl bg-slate-950"
                        style={{ minHeight: "340px" }}
                    >
                        {featuredPost.image && (
                            <img
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                                style={{ maxHeight: "420px", width: "100%", display: "block" }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-4">
                            <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-400">
                                <span className="flex h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                                Featured
                            </span>
                            <h2 className="text-2xl md:text-4xl font-bold text-white max-w-3xl leading-tight">
                                {featuredPost.title}
                            </h2>
                            <p className="text-slate-300 line-clamp-2 max-w-2xl hidden sm:block">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <a
                                    href={`/posts/${featuredPost.slug}`}
                                    className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors text-sm"
                                >
                                    Read Full Story <ArrowRight className="w-4 h-4" />
                                </a>
                                <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                                    <Clock className="w-4 h-4" />
                                    {new Date(featuredPost.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Post Grid */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="text-center py-24 text-red-500">{error}</div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={searchTerm + categoryName + activeFilter}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto"
                        >
                            {combinedItems.map((item, index) => {
                                const adSize = item.type === "post" && item.data.category === "Chemical Business Mart" ? item.data.adSize : null;
                                const spanClass = getAdSizeClasses(adSize);
                                return (
                                    <motion.div
                                        key={`${item.type}-${item.data._id}-${index}`}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.04 }}
                                        className={spanClass}
                                    >
                                        {item.type === "post" ? (
                                            item.data.category === "Chemical Business Mart" ? (
                                                <ChemicalMartCard post={item.data} />
                                            ) : (
                                                <PostCard {...item.data} />
                                            )
                                        ) : (
                                            <InFeedAd ad={item.data} className="h-full" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                )}

                {!loading && posts.length === 0 && (
                    <div className="bg-gray-50 rounded-2xl p-16 text-center">
                        <p className="text-gray-500 text-lg">No posts found{activeFilter !== "All" ? ` in "${activeFilter}"` : ` in ${categoryName}`}.</p>
                        {(searchTerm || activeFilter !== "All") && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Clear search
                                    </button>
                                )}
                                {activeFilter !== "All" && (
                                    <button
                                        onClick={() => setActiveFilter("All")}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Show all
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
