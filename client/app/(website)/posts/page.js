"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/PostCard";
import ChemicalMartCard from "@/components/ChemicalMartCard";
import InFeedAd from "@/components/InFeedAd";
import { Search, Loader2, Clock, ArrowRight, Share2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPosts, fetchActiveAds } from "@/lib/api";
import { toast } from "sonner";

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

const CATEGORIES = [
    "All",
    "News Roundup",
    "Chemical Mart",
    "Research & Reports",
    "Corporate Profile",
    "Start up",
    "Services",
    "Executive Brief",
];

function AllPostsContent() {
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState(() => {
        return "All";
    });
    const [posts, setPosts] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Read category from URL query param on mount
    useEffect(() => {
        const cat = searchParams.get("category");
        if (cat) setActiveCategory(cat);
    }, [searchParams]);

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, activeCategory]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [postsData, adsData] = await Promise.all([
                fetchPosts(activeCategory, searchTerm),
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

    // Interleave ads
    const getCombinedItems = () => {
        const combined = [];
        let adIndex = 0;
        posts.forEach((post, index) => {
            combined.push({ type: 'post', data: post });
            // Insert ad every 3 posts (User asked for 3-4)
            if ((index + 1) % 3 === 0 && ads.length > 0) {
                combined.push({ type: 'ad', data: ads[adIndex % ads.length] });
                adIndex++;
            }
        });
        return combined;
    };

    const combinedItems = getCombinedItems();

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Filter (Desktop) / Top Bar (Mobile) */}
                <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold mb-4">Search</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Categories</h3>
                        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar">
                            {CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === category
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Post Grid */}
                <main className="flex-1">
                    {/* Story of the Day - ONLY on News Roundup */}
                    {activeCategory === "News Roundup" && !searchTerm && posts.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm font-black uppercase tracking-widest text-red-500">Story of the Day</span>
                            </div>
                            {(() => {
                                const story = posts.find(p => p.isStoryOfTheDay) || posts[0];
                                return (
                                    <motion.a
                                        href={`/posts/${story.slug}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
                                    >
                                        {/* Image Section - 25% increased height, full width */}
                                        {story.image && (
                                            <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden bg-slate-100">
                                                <img
                                                    src={story.image}
                                                    alt={story.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                {/* Top left badge */}
                                                <div className="absolute top-3.5 left-3.5 z-10">
                                                    <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                        Featured Story
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Text Section - clean, below image with comfortable spacing */}
                                        <div className="p-5 sm:p-6 md:p-7 bg-white space-y-3">
                                            <div className="flex items-center gap-2.5 text-xs text-gray-400 flex-wrap">
                                                <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full text-xs">
                                                    {story.category}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium text-gray-500">
                                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                                    {new Date(story.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </span>
                                                {story.author && (
                                                    <span className="ml-auto font-medium text-gray-600">By {story.author}</span>
                                                )}
                                            </div>

                                            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                                {story.title}
                                            </h2>

                                            {story.excerpt && (
                                                <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2">
                                                    {story.excerpt}
                                                </p>
                                            )}

                                            <div className="pt-1.5">
                                                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full font-bold text-xs sm:text-sm shadow-xs group-hover:bg-primary/90 transition-all">
                                                    <span>Read Full Story</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.a>
                                );
                            })()}
                            <div className="mt-10 mb-6 border-b border-slate-100" />
                        </div>
                    )}


                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {loading ? "Searching..." : `${posts.length} article${posts.length !== 1 ? "s" : ""} found`}
                                </p>
                            </div>
                        </div>
                        {/* Quick Filter Chips */}
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                        activeCategory === cat
                                            ? "bg-blue-600 border-blue-600 text-white shadow"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto">
                            {combinedItems.map((item, index) => {
                                const adSize = item.type === 'post' && item.data.category === 'Chemical Mart' ? item.data.adSize : null;
                                const spanClass = getAdSizeClasses(adSize);
                                return (
                                    <motion.div
                                        key={`${item.type}-${item.data._id}-${index}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={spanClass}
                                    >
                                        {item.type === 'post' ? (
                                            item.data.category === 'Chemical Mart' ? (
                                                <ChemicalMartCard post={item.data} className="h-full" />
                                            ) : (
                                                <PostCard {...item.data} />
                                            )
                                        ) : (
                                            <InFeedAd ad={item.data} className="h-full" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && posts.length === 0 && (
                        <div className="bg-muted/30 rounded-xl p-12 text-center">
                            <p className="text-muted-foreground text-lg">No posts found matching your criteria.</p>
                            <button
                                onClick={() => { setSearchTerm(""); setActiveCategory("All") }}
                                className="mt-4 text-primary hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}

export default function AllPostsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <AllPostsContent />
        </Suspense>
    );
}
