"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/PostCard";
import ChemicalMartCard from "@/components/ChemicalMartCard";
import InFeedAd from "@/components/InFeedAd";
import { Search, Loader2 } from "lucide-react";
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

const CATEGORIES = [
    "All",
    "News Roundup",
    "Chemical Mart",
    "Research & Reports",
    "Corporate Profile",
    "START UP",
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
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
                            <p className="text-muted-foreground mt-2">
                                {loading ? "Searching..." : `${posts.length} article${posts.length !== 1 ? "s" : ""} found`}
                            </p>
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
