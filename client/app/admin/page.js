"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Eye, TrendingUp, Loader2 } from "lucide-react";
import { fetchPosts, fetchActiveAds } from "@/lib/api";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        posts: 0,
        ads: 0,
        views: 0 // Mock for now or would need analytics API
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [postsData, adsData] = await Promise.all([
                    fetchPosts(),
                    fetchActiveAds()
                ]);
                setStats({
                    posts: postsData.length,
                    ads: adsData.length,
                    views: "1.2K" // Placeholder
                });
            } catch (error) {
                console.error("Failed to load admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-primary" /></div>;
    }

    const statCards = [
        { name: "Total Posts", value: stats.posts, icon: FileText, change: "Live", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
        { name: "Active Ads", value: stats.ads, icon: TrendingUp, change: "Running", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
        { name: "Total Views", value: stats.views, icon: Eye, change: "Estimated", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
        { name: "Admins", value: "1", icon: Users, change: "Active", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
                            <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                                <span className="text-xs font-medium text-green-500">{stat.change}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[200px]">
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/create-post" className="p-4 rounded-lg bg-accent/50 hover:bg-accent border border-border flex flex-col items-center justify-center space-y-2 transition-colors">
                            <FileText className="w-6 h-6" />
                            <span className="font-medium">Create Post</span>
                        </Link>
                        <Link href="/admin/ads" className="p-4 rounded-lg bg-accent/50 hover:bg-accent border border-border flex flex-col items-center justify-center space-y-2 transition-colors">
                            <TrendingUp className="w-6 h-6" />
                            <span className="font-medium">Manage Ads</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

