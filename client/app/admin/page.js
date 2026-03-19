"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Eye, TrendingUp, Loader2, Globe, Monitor, MousePointerClick, Clock } from "lucide-react";
import { fetchPosts, fetchActiveAds, fetchAnalyticsSummary } from "@/lib/api";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

function formatTime(seconds) {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

export default function AdminDashboard() {
    const { user } = useUser();
    const isAdmin = user?.role === "admin";

    const [stats, setStats] = useState({ posts: 0, ads: 0, views: "1.2K" });
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [postsData, adsData] = await Promise.all([fetchPosts(), fetchActiveAds()]);
                setStats({ posts: postsData.length, ads: adsData.length, views: "1.2K" });
            } catch (error) {
                console.error("Failed to load admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        if (!isAdmin) { setAnalyticsLoading(false); return; }
        const loadAnalytics = async () => {
            try {
                const data = await fetchAnalyticsSummary();
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setAnalyticsLoading(false);
            }
        };
        loadAnalytics();
    }, [isAdmin]);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-primary" /></div>;
    }

    const statCards = [
        { name: "Total Posts", value: stats.posts, icon: FileText, change: "Live", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
        { name: "Active Ads", value: stats.ads, icon: TrendingUp, change: "Running", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
        { name: "Total Views", value: stats.views, icon: Eye, change: "Estimated", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
        { name: "Admins", value: "1", icon: Users, change: "Active", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">Manage your publications and monitor performance.</p>
                </div>
                <div className="flex items-center gap-4 bg-card p-3 rounded-xl border border-border shadow-sm">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shrink-0">
                        {user.photo ? (
                            <img src={user.photo} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-xl font-bold text-primary">{(user.username || "A")[0]?.toUpperCase()}</div>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logged in as</p>
                        <p className="font-bold text-foreground">{user.username || "Admin"}</p>
                        <span className="text-[10px] text-primary font-semibold uppercase">{user.role}</span>
                    </div>
                </div>
            </div>

            {/* General Stat Cards */}
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

            {/* ── ADMIN-ONLY: Visitor Analytics Section ── */}
            {isAdmin && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Visitor Analytics</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Real-time tracking of website visitors</p>
                        </div>
                        <Link
                            href="/admin/analytics"
                            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                            View Detailed Report →
                        </Link>
                    </div>

                    {analyticsLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="animate-spin text-primary w-6 h-6" />
                        </div>
                    ) : analytics ? (
                        <>
                            {/* Analytics Stat Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { name: "Unique Visitors", value: analytics.totalUniqueIPs, icon: Globe, color: "text-sky-500", bg: "bg-sky-100 dark:bg-sky-900/20" },
                                    { name: "Total Sessions", value: analytics.totalUniqueSessions, icon: Monitor, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/20" },
                                    { name: "Total Page Visits", value: analytics.totalVisits, icon: Eye, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/20" },
                                    { name: "Avg. Time on Site", value: formatTime(analytics.avgTimeSeconds), icon: Clock, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/20" },
                                ].map((card) => {
                                    const Icon = card.icon;
                                    return (
                                        <div key={card.name} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
                                            <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">{card.name}</p>
                                                <h3 className="text-2xl font-bold">{card.value}</h3>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Two-column: Top IPs + Top Pages */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top IPs */}
                                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                        <h3 className="font-bold text-base">Top Visitor IPs</h3>
                                        <span className="text-xs text-muted-foreground">by total visits</span>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {analytics.topIPs?.length === 0 && (
                                            <p className="text-sm text-muted-foreground p-6">No visitor data yet.</p>
                                        )}
                                        {analytics.topIPs?.slice(0, 8).map((item, i) => (
                                            <div key={item._id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                                    <div>
                                                        <p className="text-sm font-mono font-medium">{item._id}</p>
                                                        <p className="text-xs text-muted-foreground">{item.sessions} session{item.sessions !== 1 ? "s" : ""} · {formatTime(item.totalTime)}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-primary">{item.totalVisits} visits</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Pages */}
                                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                        <h3 className="font-bold text-base">Most Visited Pages</h3>
                                        <span className="text-xs text-muted-foreground">by hit count</span>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {analytics.topPages?.length === 0 && (
                                            <p className="text-sm text-muted-foreground p-6">No page data yet.</p>
                                        )}
                                        {analytics.topPages?.slice(0, 8).map((item, i) => (
                                            <div key={item._id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                                    <p className="text-sm font-medium truncate max-w-[200px]">{item._id || "/"}</p>
                                                </div>
                                                <span className="text-sm font-bold text-primary">{item.count} hits</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Top Buttons Clicked */}
                            {analytics.topButtons?.length > 0 && (
                                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-border">
                                        <h3 className="font-bold text-base">Most Clicked Buttons / Links</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40 text-muted-foreground">
                                                <tr>
                                                    <th className="text-left px-6 py-3 font-semibold">#</th>
                                                    <th className="text-left px-6 py-3 font-semibold">Label</th>
                                                    <th className="text-right px-6 py-3 font-semibold">Clicks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {analytics.topButtons.slice(0, 5).map((btn, i) => (
                                                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                                                        <td className="px-6 py-3 text-muted-foreground">{i + 1}</td>
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <MousePointerClick className="w-4 h-4 text-primary shrink-0" />
                                                                <span className="truncate max-w-[300px]">{btn._id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-right font-bold text-primary">{btn.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-card p-8 rounded-xl border border-border text-center">
                            <p className="text-muted-foreground">Analytics data unavailable.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions */}
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
                        {isAdmin && (
                            <Link href="/admin/analytics" className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 flex flex-col items-center justify-center space-y-2 transition-colors">
                                <Globe className="w-6 h-6 text-primary" />
                                <span className="font-medium text-primary">Analytics</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
