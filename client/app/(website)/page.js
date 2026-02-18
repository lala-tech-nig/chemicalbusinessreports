"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import PostCard from "@/components/PostCard";
import ChemicalMartCard from "@/components/ChemicalMartCard";
import InFeedAd from "@/components/InFeedAd";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { fetchPosts, fetchActiveAds } from "@/lib/api";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all posts and ads
        const [postsData, adsData] = await Promise.all([
          fetchPosts(),
          fetchActiveAds()
        ]);
        setPosts(postsData);
        setAds(adsData);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter posts based on active category
  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter(post => post.category === activeCategory);
  }, [activeCategory, posts]);

  // Find Story of the Day
  const storyOfTheDay = posts.find(post => post.isStoryOfTheDay) || posts[0];

  // Interleave ads
  const combinedItems = useMemo(() => {
    const combined = [];
    let adIndex = 0;

    // 1. Interleave ads with posts
    filteredPosts.forEach((post, index) => {
      combined.push({ type: 'post', data: post });
      // Insert ad every 4 posts IF we still have unique ads to show
      if ((index + 1) % 4 === 0 && adIndex < ads.length) {
        combined.push({ type: 'ad', data: ads[adIndex] });
        adIndex++;
      }
    });

    // 2. If there are remaining ads not yet shown, append them
    while (adIndex < ads.length) {
      combined.push({ type: 'ad', data: ads[adIndex] });
      adIndex++;
    }

    return combined;
  }, [filteredPosts, ads]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Hero story={storyOfTheDay} />

      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-border py-2 shadow-sm transition-all">
        <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {activeCategory === "All" ? "Latest Posts" : activeCategory}
          </h2>
          <span className="text-sm text-muted-foreground">{filteredPosts.length} Articles</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 auto-rows-auto">
          {combinedItems.map((item, index) => {
            const adSize = item.type === 'post' && item.data.category === 'Chemical Mart' ? item.data.adSize : null;
            const spanClass = getAdSizeClasses(adSize);
            return (
              <motion.div
                key={`${item.type}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
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

        {filteredPosts.length === 0 && (
          <div className="py-20 text-center text-muted-foreground bg-muted/20 rounded-xl">
            No posts found in this category.
          </div>
        )}

        <div className="flex justify-center w-full">
          <Link
            href="/posts"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-lg font-medium text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
          >
            View all Posts
          </Link>
        </div>

      </main>

      <FloatingWhatsApp />
    </div>
  );
}
