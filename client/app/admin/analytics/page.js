"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Globe, Monitor, MousePointerClick, Clock, Eye, ChevronDown,
    ChevronRight, Download, Search, RefreshCw, Loader2, FileText, BarChart2
} from "lucide-react";
import { fetchAnalyticsSummary, fetchAnalyticsDetailed, fetchAnalyticsByIP } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const TABS = ["Overview", "By IP", "Pages", "Buttons", "Posts"];

function formatTime(s) {
    if (!s || s < 60) return `${s || 0}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${sec}s`;
}

function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function downloadCSV(rows, filename) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

// ── Expandable IP Row ──────────────────────────────────────────────────────────
function IPRow({ log }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setOpen(p => !p)}>
                <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-mono text-sm font-medium">{log.ip}</span>
                    </div>
                </td>
                <td className="px-5 py-3 text-center">{log.totalVisits}</td>
                <td className="px-5 py-3 text-center">{log.pages?.length || 0}</td>
                <td className="px-5 py-3 text-center">{log.buttons?.length || 0}</td>
                <td className="px-5 py-3 text-center">{log.postsInteracted?.length || 0}</td>
                <td className="px-5 py-3 text-center">{formatTime(log.totalTimeSpentSeconds)}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(log.firstSeen)}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(log.lastSeen)}</td>
            </tr>
            {open && (
                <tr className="bg-muted/10">
                    <td colSpan={8} className="px-8 pb-5 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Pages */}
                            <div>
                                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Pages Visited ({log.pages?.length || 0})
                                </p>
                                <ul className="space-y-1 max-h-40 overflow-y-auto">
                                    {log.pages?.map((p, i) => (
                                        <li key={i} className="flex justify-between gap-2">
                                            <span className="truncate text-foreground">{p.path || "/"}</span>
                                            <span className="text-muted-foreground shrink-0">{formatDate(p.visitedAt)}</span>
                                        </li>
                                    )) || <li className="text-muted-foreground">None</li>}
                                </ul>
                            </div>
                            {/* Buttons */}
                            <div>
                                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                    <MousePointerClick className="w-3 h-3" /> Buttons Clicked ({log.buttons?.length || 0})
                                </p>
                                <ul className="space-y-1 max-h-40 overflow-y-auto">
                                    {log.buttons?.map((b, i) => (
                                        <li key={i} className="flex justify-between gap-2">
                                            <span className="truncate text-foreground">{b.label || "Unknown"}</span>
                                            <span className="text-muted-foreground shrink-0">{formatDate(b.clickedAt)}</span>
                                        </li>
                                    )) || <li className="text-muted-foreground">None</li>}
                                </ul>
                            </div>
                            {/* Posts */}
                            <div>
                                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Posts Interacted ({log.postsInteracted?.length || 0})
                                </p>
                                <ul className="space-y-1 max-h-40 overflow-y-auto">
                                    {log.postsInteracted?.map((p, i) => (
                                        <li key={i} className="flex justify-between gap-2">
                                            <span className="truncate text-foreground">{p.postTitle || p.postSlug || "—"}</span>
                                            <span className="text-xs text-primary font-medium shrink-0">{p.action}</span>
                                        </li>
                                    )) || <li className="text-muted-foreground">None</li>}
                                </ul>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">User Agent: {log.userAgent || "—"}</p>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [tab, setTab] = useState("Overview");
    const [summary, setSummary] = useState(null);
    const [detailed, setDetailed] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Guard: admin-only
    useEffect(() => {
        if (user && user.role && user.role !== "admin") router.push("/admin");
    }, [user, router]);

    const load = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true); else setLoading(true);
        try {
            const [s, d] = await Promise.all([
                fetchAnalyticsSummary(),
                fetchAnalyticsDetailed(page, 25)
            ]);
            setSummary(s);
            setDetailed(d);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page]);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    const filteredLogs = detailed?.logs?.filter(l =>
        !search || l.ip?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    // ── CSV Export helpers ─────────────────────────────────────────────────────
    const exportIPs = () => downloadCSV(
        (detailed?.logs || []).map(l => ({
            ip: l.ip, sessions: 1, totalVisits: l.totalVisits,
            pagesCount: l.pages?.length || 0,
            buttonsCount: l.buttons?.length || 0,
            postsCount: l.postsInteracted?.length || 0,
            timeSpent: formatTime(l.totalTimeSpentSeconds),
            firstSeen: formatDate(l.firstSeen),
            lastSeen: formatDate(l.lastSeen)
        })), "visitor_ips.csv"
    );

    const exportPages = () => downloadCSV(
        (summary?.topPages || []).map(p => ({ page: p._id, hits: p.count })),
        "top_pages.csv"
    );

    const exportButtons = () => downloadCSV(
        (summary?.topButtons || []).map(b => ({ label: b._id, clicks: b.count })),
        "top_buttons.csv"
    );

    const exportPosts = () => downloadCSV(
        (summary?.topPosts || []).map(p => ({ slug: p._id, title: p.title || "—", interactions: p.count })),
        "top_posts.csv"
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Detailed Visitor Report</h1>
                        <p className="text-sm text-muted-foreground">Full analytics of all website visitors</p>
                    </div>
                </div>
                <button
                    onClick={() => load(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Unique IPs", value: summary.totalUniqueIPs, icon: Globe, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/20" },
                        { label: "Total Sessions", value: summary.totalUniqueSessions, icon: Monitor, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                        { label: "Page Visits", value: summary.totalVisits, icon: Eye, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
                        { label: "Avg Time on Site", value: formatTime(summary.avgTimeSeconds), icon: Clock, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
                    ].map(c => {
                        const Icon = c.icon;
                        return (
                            <div key={c.label} className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${c.bg} ${c.color} shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                                    <p className="text-xl font-bold">{c.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex border-b border-border overflow-x-auto">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                                tab === t
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* ── OVERVIEW TAB ── */}
                    {tab === "Overview" && summary && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-3">Top Visitor IPs</h3>
                                <div className="space-y-2">
                                    {summary.topIPs?.map((ip, i) => (
                                        <div key={ip._id} className="flex items-center justify-between py-2 px-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                                                <span className="font-mono text-sm">{ip._id}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-muted-foreground">{ip.sessions} session{ip.sessions !== 1 ? "s" : ""}</span>
                                                <span className="font-bold text-primary">{ip.totalVisits} visits</span>
                                            </div>
                                        </div>
                                    ))}
                                    {summary.topIPs?.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-3">Top Pages</h3>
                                <div className="space-y-2">
                                    {summary.topPages?.map((pg, i) => (
                                        <div key={pg._id} className="flex items-center justify-between py-2 px-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                                                <span className="text-sm truncate max-w-[220px]">{pg._id || "/"}</span>
                                            </div>
                                            <span className="font-bold text-primary">{pg.count}</span>
                                        </div>
                                    ))}
                                    {summary.topPages?.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BY IP TAB ── */}
                    {tab === "By IP" && (
                        <div>
                            <div className="flex flex-col sm:flex-row gap-4 mb-5">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Filter by IP address..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <button
                                    onClick={exportIPs}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="text-left px-5 py-3 font-semibold">IP Address</th>
                                            <th className="text-center px-5 py-3 font-semibold">Total Visits</th>
                                            <th className="text-center px-5 py-3 font-semibold">Pages</th>
                                            <th className="text-center px-5 py-3 font-semibold">Clicks</th>
                                            <th className="text-center px-5 py-3 font-semibold">Posts</th>
                                            <th className="text-center px-5 py-3 font-semibold">Time Spent</th>
                                            <th className="text-left px-5 py-3 font-semibold">First Seen</th>
                                            <th className="text-left px-5 py-3 font-semibold">Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredLogs.length === 0 ? (
                                            <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No visitor records found.</td></tr>
                                        ) : (
                                            filteredLogs.map(log => <IPRow key={log._id} log={log} />)
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {detailed && detailed.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Page {detailed.page} of {detailed.totalPages} · {detailed.total} total records
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted/50 transition-colors"
                                        >Previous</button>
                                        <button
                                            disabled={page >= detailed.totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted/50 transition-colors"
                                        >Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PAGES TAB ── */}
                    {tab === "Pages" && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={exportPages} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="text-left px-5 py-3 font-semibold">#</th>
                                            <th className="text-left px-5 py-3 font-semibold">Page Path</th>
                                            <th className="text-right px-5 py-3 font-semibold">Total Hits</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {summary?.topPages?.length === 0 && (
                                            <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">No page data yet.</td></tr>
                                        )}
                                        {summary?.topPages?.map((pg, i) => (
                                            <tr key={pg._id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                                                <td className="px-5 py-3 font-medium">{pg._id || "/"}</td>
                                                <td className="px-5 py-3 text-right font-bold text-primary">{pg.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── BUTTONS TAB ── */}
                    {tab === "Buttons" && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={exportButtons} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="text-left px-5 py-3 font-semibold">#</th>
                                            <th className="text-left px-5 py-3 font-semibold">Button / Link Label</th>
                                            <th className="text-right px-5 py-3 font-semibold">Total Clicks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {summary?.topButtons?.length === 0 && (
                                            <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">No button data yet.</td></tr>
                                        )}
                                        {summary?.topButtons?.map((btn, i) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <MousePointerClick className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="font-medium">{btn._id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right font-bold text-primary">{btn.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── POSTS TAB ── */}
                    {tab === "Posts" && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={exportPosts} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="text-left px-5 py-3 font-semibold">#</th>
                                            <th className="text-left px-5 py-3 font-semibold">Post Title / Slug</th>
                                            <th className="text-right px-5 py-3 font-semibold">Interactions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {summary?.topPosts?.length === 0 && (
                                            <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">No post interaction data yet.</td></tr>
                                        )}
                                        {summary?.topPosts?.map((p, i) => (
                                            <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="font-medium">{p.title || p._id || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right font-bold text-primary">{p.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
