"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Globe, Monitor, MousePointerClick, Clock, Eye, ChevronDown,
    ChevronRight, Download, Search, RefreshCw, Loader2, FileText, BarChart2,
    Calendar, Filter, Send, Mail, CheckCircle, AlertTriangle, ShieldCheck,
    Laptop, Smartphone, Tablet, Zap, Check, ArrowUpDown
} from "lucide-react";
import {
    fetchAnalyticsSummary,
    fetchAnalyticsDetailed,
    fetchDailyVisitors,
    fetchReportLogs,
    fetchReportStatus,
    triggerDailyReport,
    triggerWeeklyReport,
    triggerTestVisitorAlert
} from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const TABS = ["Detailed Logs", "Daily Visitors Log", "Overview & Rankings", "Automated Reports & Alerts"];

const DATE_PRESETS = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Past 7 Days", value: "7days" },
    { label: "Past 30 Days", value: "30days" },
    { label: "This Month", value: "thisMonth" },
    { label: "Custom Range", value: "custom" }
];

const SORT_OPTIONS = [
    { label: "Most Recent Activity", value: "lastSeen", order: "desc" },
    { label: "First Seen (Oldest)", value: "firstSeen", order: "asc" },
    { label: "Most Page Visits", value: "totalVisits", order: "desc" },
    { label: "Longest Time Spent", value: "timeSpent", order: "desc" }
];

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

function formatDateShort(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric"
    });
}

function downloadCSV(rows, filename) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

// ── Device Icon Helper ────────────────────────────────────────────────────────
function DeviceIcon({ device }) {
    if (device === "Mobile") return <Smartphone className="w-3.5 h-3.5 text-emerald-500" title="Mobile" />;
    if (device === "Tablet") return <Tablet className="w-3.5 h-3.5 text-amber-500" title="Tablet" />;
    return <Laptop className="w-3.5 h-3.5 text-sky-500" title="Desktop" />;
}

// ── Expandable IP Row ──────────────────────────────────────────────────────────
function IPRow({ log }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setOpen(p => !p)}>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <DeviceIcon device={log.device} />
                        <span className="font-mono text-sm font-semibold text-foreground">{log.ip}</span>
                        {log.country && log.country !== "Unknown" && (
                            <span className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                                {log.city ? `${log.city}, ` : ""}{log.country}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-primary">{log.totalVisits}</td>
                <td className="px-4 py-3 text-center">{log.pages?.length || 0}</td>
                <td className="px-4 py-3 text-center">{log.buttons?.length || 0}</td>
                <td className="px-4 py-3 text-center">{log.postsInteracted?.length || 0}</td>
                <td className="px-4 py-3 text-center font-medium text-foreground">{formatTime(log.totalTimeSpentSeconds)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(log.firstSeen)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-medium">{formatDate(log.lastSeen)}</td>
            </tr>
            {open && (
                <tr className="bg-muted/10">
                    <td colSpan={8} className="px-6 pb-5 pt-3 border-b border-border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Pages */}
                            <div className="bg-card p-3 rounded-lg border border-border">
                                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-sky-500" /> Pages Visited ({log.pages?.length || 0})
                                </p>
                                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                                    {log.pages?.map((p, i) => (
                                        <li key={i} className="flex justify-between items-center gap-2 py-1 border-b border-border/50 last:border-0">
                                            <span className="truncate text-foreground font-mono">{p.path || "/"}</span>
                                            <span className="text-muted-foreground shrink-0 text-[11px]">{formatDate(p.visitedAt)}</span>
                                        </li>
                                    )) || <li className="text-muted-foreground italic">No pages logged</li>}
                                </ul>
                            </div>
                            {/* Buttons */}
                            <div className="bg-card p-3 rounded-lg border border-border">
                                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <MousePointerClick className="w-3.5 h-3.5 text-violet-500" /> Buttons Clicked ({log.buttons?.length || 0})
                                </p>
                                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                                    {log.buttons?.map((b, i) => (
                                        <li key={i} className="flex justify-between items-center gap-2 py-1 border-b border-border/50 last:border-0">
                                            <span className="truncate text-foreground font-medium">{b.label || "Unknown"}</span>
                                            <span className="text-muted-foreground shrink-0 text-[11px]">{formatDate(b.clickedAt)}</span>
                                        </li>
                                    )) || <li className="text-muted-foreground italic">No clicks logged</li>}
                                </ul>
                            </div>
                            {/* Posts */}
                            <div className="bg-card p-3 rounded-lg border border-border">
                                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-amber-500" /> Posts Interacted ({log.postsInteracted?.length || 0})
                                </p>
                                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                                    {log.postsInteracted?.map((p, i) => (
                                        <li key={i} className="flex justify-between items-center gap-2 py-1 border-b border-border/50 last:border-0">
                                            <span className="truncate text-foreground font-medium">{p.postTitle || p.postSlug || "—"}</span>
                                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded shrink-0">{p.action}</span>
                                        </li>
                                    )) || <li className="text-muted-foreground italic">No post actions</li>}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-card/60 px-3 py-2 rounded-lg border border-border/60">
                            <span><strong>Session ID:</strong> <span className="font-mono">{log.sessionId}</span></span>
                            <span><strong>Device:</strong> {log.device || "Desktop"} • {log.browser || "Browser"} • {log.os || "OS"}</span>
                            <span className="truncate max-w-md"><strong>User Agent:</strong> {log.userAgent || "—"}</span>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Daily Visitor Day Accordion ───────────────────────────────────────────────
function DailyDayGroup({ group }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-sm">
            <div
                onClick={() => setOpen(p => !p)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/40 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-base text-foreground">{formatDateShort(group.day)}</h4>
                        <p className="text-xs text-muted-foreground">Date: {group.day}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="text-center">
                        <p className="text-[11px] text-muted-foreground font-medium uppercase">Unique IPs</p>
                        <p className="text-base font-bold text-sky-600 dark:text-sky-400">{group.uniqueIPsCount}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] text-muted-foreground font-medium uppercase">Total Visits</p>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{group.totalVisits}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] text-muted-foreground font-medium uppercase">Sessions</p>
                        <p className="text-base font-bold text-violet-600 dark:text-violet-400">{group.totalSessions}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] text-muted-foreground font-medium uppercase">Avg Time</p>
                        <p className="text-base font-bold text-rose-600 dark:text-rose-400">{formatTime(group.avgTimeSeconds)}</p>
                    </div>
                    <div className="text-muted-foreground pl-2">
                        {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            {open && (
                <div className="p-4 border-t border-border bg-muted/10">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Active Visitor IP Addresses on {group.day} ({group.logs?.length || 0} Records)
                        </h5>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                downloadCSV(
                                    group.logs.map(l => ({
                                        date: group.day,
                                        ip: l.ip,
                                        visits: l.totalVisits,
                                        timeSpent: formatTime(l.totalTimeSpentSeconds),
                                        device: l.device || "Desktop",
                                        country: l.country || "Unknown",
                                        pagesCount: l.pagesCount || 0,
                                        lastSeen: formatDate(l.lastSeen)
                                    })),
                                    `daily_visitors_${group.day}.csv`
                                );
                            }}
                            className="text-xs flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                            <Download className="w-3.5 h-3.5" /> Export Day CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-border bg-card">
                        <table className="w-full text-xs">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="text-left px-3 py-2">IP Address</th>
                                    <th className="text-center px-3 py-2">Visits</th>
                                    <th className="text-center px-3 py-2">Pages</th>
                                    <th className="text-center px-3 py-2">Clicks</th>
                                    <th className="text-center px-3 py-2">Time Spent</th>
                                    <th className="text-center px-3 py-2">Device</th>
                                    <th className="text-left px-3 py-2">Location</th>
                                    <th className="text-left px-3 py-2">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {group.logs?.map((l, i) => (
                                    <tr key={i} className="hover:bg-muted/30">
                                        <td className="px-3 py-2 font-mono font-bold text-foreground">{l.ip}</td>
                                        <td className="px-3 py-2 text-center font-semibold text-primary">{l.totalVisits}</td>
                                        <td className="px-3 py-2 text-center">{l.pagesCount}</td>
                                        <td className="px-3 py-2 text-center">{l.buttonsCount}</td>
                                        <td className="px-3 py-2 text-center">{formatTime(l.totalTimeSpentSeconds)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="inline-flex items-center gap-1">
                                                <DeviceIcon device={l.device} /> {l.device || "Desktop"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground">{l.country || "—"}</td>
                                        <td className="px-3 py-2 text-muted-foreground">{formatDate(l.lastSeen)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const { user } = useUser();
    const router = useRouter();

    // State
    const [tab, setTab] = useState("Detailed Logs");
    const [summary, setSummary] = useState(null);
    const [detailed, setDetailed] = useState(null);
    const [dailyVisitors, setDailyVisitors] = useState(null);
    const [reportStatus, setReportStatus] = useState(null);
    const [reportLogs, setReportLogs] = useState([]);

    // Filters
    const [dateRange, setDateRange] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("lastSeen");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    // Actions & UI
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionMsg, setActionMsg] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Guard: admin-only
    useEffect(() => {
        if (user && user.role && user.role !== "admin") router.push("/admin");
    }, [user, router]);

    // Data loader
    const loadAll = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true); else setLoading(true);
        try {
            const filterParams = {
                dateRange: dateRange !== "custom" ? dateRange : undefined,
                startDate: dateRange === "custom" && startDate ? startDate : undefined,
                endDate: dateRange === "custom" && endDate ? endDate : undefined,
                search: search || undefined,
                sortBy,
                sortOrder,
                page,
                limit
            };

            const [s, d, dv, rs, rl] = await Promise.all([
                fetchAnalyticsSummary(filterParams),
                fetchAnalyticsDetailed(filterParams),
                fetchDailyVisitors(30),
                fetchReportStatus().catch(() => null),
                fetchReportLogs().catch(() => [])
            ]);

            setSummary(s);
            setDetailed(d);
            setDailyVisitors(dv);
            if (rs) setReportStatus(rs);
            if (rl) setReportLogs(rl);
        } catch (err) {
            console.error("Analytics load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [dateRange, startDate, endDate, search, sortBy, sortOrder, page, limit]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    // Reset pagination on filter change
    useEffect(() => {
        setPage(1);
    }, [dateRange, startDate, endDate, search, sortBy, sortOrder, limit]);

    // Manual action triggers
    const handleTriggerDaily = async () => {
        setActionLoading(true);
        setActionMsg(null);
        try {
            const res = await triggerDailyReport();
            setActionMsg({ type: "success", text: res.message || "Daily report sent successfully!" });
            loadAll(true);
        } catch (err) {
            setActionMsg({ type: "error", text: err.message || "Failed to send daily report" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleTriggerWeekly = async () => {
        setActionLoading(true);
        setActionMsg(null);
        try {
            const res = await triggerWeeklyReport();
            setActionMsg({ type: "success", text: res.message || "Weekly Thursday report sent successfully!" });
            loadAll(true);
        } catch (err) {
            setActionMsg({ type: "error", text: err.message || "Failed to send weekly report" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleTestAlert = async () => {
        setActionLoading(true);
        setActionMsg(null);
        try {
            const res = await triggerTestVisitorAlert();
            setActionMsg({ type: "success", text: res.message || "Test visitor alert email sent to coslab.media@gmail.com!" });
        } catch (err) {
            setActionMsg({ type: "error", text: err.message || "Failed to send test alert" });
        } finally {
            setActionLoading(false);
        }
    };

    // CSV Exports
    const exportFilteredLogs = () => {
        downloadCSV(
            (detailed?.logs || []).map(l => ({
                ip: l.ip,
                totalVisits: l.totalVisits,
                pagesCount: l.pages?.length || 0,
                buttonsCount: l.buttons?.length || 0,
                postsInteractedCount: l.postsInteracted?.length || 0,
                timeSpentSeconds: l.totalTimeSpentSeconds,
                timeSpentFormatted: formatTime(l.totalTimeSpentSeconds),
                device: l.device || "Desktop",
                country: l.country || "Unknown",
                city: l.city || "",
                firstSeen: formatDate(l.firstSeen),
                lastSeen: formatDate(l.lastSeen),
                sessionId: l.sessionId
            })),
            `visitor_report_${dateRange}_${new Date().toISOString().split("T")[0]}.csv`
        );
    };

    const exportDailySummary = () => {
        downloadCSV(
            (dailyVisitors?.dailyBreakdown || []).map(d => ({
                date: d.day,
                uniqueIPs: d.uniqueIPsCount,
                totalVisits: d.totalVisits,
                totalSessions: d.totalSessions,
                avgTimeSpent: formatTime(d.avgTimeSeconds),
                ipList: (d.uniqueIPsList || []).join("; ")
            })),
            `daily_visitors_summary_${new Date().toISOString().split("T")[0]}.csv`
        );
    };

    if (loading && !summary) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-3">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
                <p className="text-sm font-medium text-muted-foreground">Loading visitor analytics & reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                        <BarChart2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                            Detailed Visitor Report & Notification Hub
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Live visitor IP recording, daily traffic breakdown, and automated email reporting
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={exportFilteredLogs}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-semibold shadow-sm"
                    >
                        <Download className="w-4 h-4 text-muted-foreground" />
                        Export Filtered CSV
                    </button>
                    <button
                        onClick={() => loadAll(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Notification / Action Message Alert */}
            {actionMsg && (
                <div className={`p-4 rounded-xl flex items-center justify-between gap-3 border ${
                    actionMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800"
                }`}>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        {actionMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {actionMsg.text}
                    </div>
                    <button onClick={() => setActionMsg(null)} className="text-xs underline hover:no-underline font-bold">
                        Dismiss
                    </button>
                </div>
            )}

            {/* ── FILTER TOOLBAR ─────────────────────────────────────────────── */}
            <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Filter by IP address, page path, location, user agent..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
                            <Calendar className="w-3.5 h-3.5" /> Range:
                        </div>
                        <select
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        >
                            {DATE_PRESETS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground ml-2 mr-1">
                            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                        </div>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        >
                            {SORT_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Custom Date Pickers if 'custom' selected */}
                {dateRange === "custom" && (
                    <div className="pt-3 border-t border-border flex flex-wrap items-center gap-4 text-sm bg-muted/20 p-3 rounded-xl">
                        <span className="font-semibold text-xs text-muted-foreground uppercase">Custom Filter:</span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">From:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">To:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); setDateRange("all"); }}
                                className="text-xs text-primary underline font-medium"
                            >
                                Clear Custom Dates
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── SUMMARY STAT CARDS ─────────────────────────────────────────── */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Unique Visitor IPs", value: summary.totalUniqueIPs, icon: Globe, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/40" },
                        { label: "Total Visitor Sessions", value: summary.totalUniqueSessions, icon: Monitor, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
                        { label: "Total Page Visits", value: summary.totalVisits, icon: Eye, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
                        { label: "Avg Session Duration", value: formatTime(summary.avgTimeSeconds), icon: Clock, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
                    ].map(c => {
                        const Icon = c.icon;
                        return (
                            <div key={c.label} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5">
                                <div className={`p-3.5 rounded-xl ${c.bg} ${c.color} shrink-0`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold">{c.label}</p>
                                    <p className="text-2xl font-black text-foreground mt-0.5">{c.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── TABS ───────────────────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex border-b border-border overflow-x-auto bg-muted/20">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                                tab === t
                                    ? "border-primary text-primary bg-card"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t === "Detailed Logs" && <Filter className="w-4 h-4" />}
                            {t === "Daily Visitors Log" && <Calendar className="w-4 h-4" />}
                            {t === "Overview & Rankings" && <BarChart2 className="w-4 h-4" />}
                            {t === "Automated Reports & Alerts" && <Mail className="w-4 h-4" />}
                            {t}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* ══════════════════════════════════════════════════════════
                        TAB 1: DETAILED VISITOR LOGS
                    ══════════════════════════════════════════════════════════ */}
                    {tab === "Detailed Logs" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-bold text-foreground">{detailed?.logs?.length || 0}</span> of{" "}
                                    <span className="font-bold text-foreground">{detailed?.total || 0}</span> visitor records
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">Rows per page:</span>
                                    <select
                                        value={limit}
                                        onChange={e => setLimit(parseInt(e.target.value, 10))}
                                        className="px-2 py-1 rounded border border-border bg-background"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold">IP Address & Details</th>
                                            <th className="text-center px-4 py-3 font-semibold">Total Visits</th>
                                            <th className="text-center px-4 py-3 font-semibold">Pages</th>
                                            <th className="text-center px-4 py-3 font-semibold">Clicks</th>
                                            <th className="text-center px-4 py-3 font-semibold">Posts</th>
                                            <th className="text-center px-4 py-3 font-semibold">Time Spent</th>
                                            <th className="text-left px-4 py-3 font-semibold">First Seen</th>
                                            <th className="text-left px-4 py-3 font-semibold">Last Active</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {detailed?.logs?.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-16 text-muted-foreground">
                                                    No visitor records match the selected filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            detailed?.logs?.map(log => <IPRow key={log._id} log={log} />)
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {detailed && detailed.totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Page <span className="font-semibold text-foreground">{detailed.page}</span> of{" "}
                                        <span className="font-semibold text-foreground">{detailed.totalPages}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className="px-3.5 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted/50 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            disabled={page >= detailed.totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-3.5 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted/50 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 2: DAILY VISITORS LOG
                    ══════════════════════════════════════════════════════════ */}
                    {tab === "Daily Visitors Log" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">Day-by-Day Visitor IP Breakdown</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Daily record of unique IP visits, session durations, and user activity
                                    </p>
                                </div>
                                <button
                                    onClick={exportDailySummary}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" /> Export All Days CSV
                                </button>
                            </div>

                            {dailyVisitors?.dailyBreakdown?.length === 0 ? (
                                <p className="text-center py-16 text-muted-foreground text-sm">
                                    No daily visitor logs recorded yet.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {dailyVisitors?.dailyBreakdown?.map(group => (
                                        <DailyDayGroup key={group.day} group={group} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 3: OVERVIEW & RANKINGS
                    ══════════════════════════════════════════════════════════ */}
                    {tab === "Overview & Rankings" && summary && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top IPs */}
                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-sky-500" /> Top Visitor IPs by Activity
                                </h3>
                                <div className="space-y-2">
                                    {summary.topIPs?.map((ip, i) => (
                                        <div key={ip._id} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                                                <div>
                                                    <span className="font-mono text-sm font-semibold">{ip._id}</span>
                                                    {ip.country && (
                                                        <span className="text-[10px] text-muted-foreground block">{ip.country}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-xs text-muted-foreground">{ip.sessions} sess.</span>
                                                <span className="font-extrabold text-primary">{ip.totalVisits} visits</span>
                                            </div>
                                        </div>
                                    ))}
                                    {summary.topIPs?.length === 0 && <p className="text-muted-foreground text-sm">No IP activity recorded.</p>}
                                </div>
                            </div>

                            {/* Top Pages */}
                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-emerald-500" /> Top Pages Visited
                                </h3>
                                <div className="space-y-2">
                                    {summary.topPages?.map((pg, i) => (
                                        <div key={pg._id} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                                                <span className="text-sm font-mono truncate max-w-[240px]">{pg._id || "/"}</span>
                                            </div>
                                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{pg.count} hits</span>
                                        </div>
                                    ))}
                                    {summary.topPages?.length === 0 && <p className="text-muted-foreground text-sm">No page hits logged.</p>}
                                </div>
                            </div>

                            {/* Top Buttons */}
                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                                    <MousePointerClick className="w-4 h-4 text-violet-500" /> Top Buttons & Links Clicked
                                </h3>
                                <div className="space-y-2">
                                    {summary.topButtons?.map((btn, i) => (
                                        <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                                                <span className="text-sm font-medium truncate max-w-[220px]">{btn._id}</span>
                                            </div>
                                            <span className="font-extrabold text-violet-600 dark:text-violet-400">{btn.count} clicks</span>
                                        </div>
                                    ))}
                                    {summary.topButtons?.length === 0 && <p className="text-muted-foreground text-sm">No button clicks logged.</p>}
                                </div>
                            </div>

                            {/* Top Posts */}
                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-500" /> Top Articles Interacted With
                                </h3>
                                <div className="space-y-2">
                                    {summary.topPosts?.map((p, i) => (
                                        <div key={p._id} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                                                <span className="text-sm font-medium truncate max-w-[220px]">{p.title || p._id || "—"}</span>
                                            </div>
                                            <span className="font-extrabold text-amber-600 dark:text-amber-400">{p.count} actions</span>
                                        </div>
                                    ))}
                                    {summary.topPosts?.length === 0 && <p className="text-muted-foreground text-sm">No article interactions logged.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 4: AUTOMATED REPORTS & ALERTS HUB
                    ══════════════════════════════════════════════════════════ */}
                    {tab === "Automated Reports & Alerts" && (
                        <div className="space-y-8">
                            {/* Scheduler Status Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Daily Report */}
                                <div className="bg-card p-5 rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Daily Executive Report</span>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full">
                                            6:00 AM WAT
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        Runs Daily at 6:00 AM Nigeria Time
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p><strong>Recipients:</strong> All active users & coslab.media@gmail.com</p>
                                        <p>
                                            <strong>Last Sent:</strong>{" "}
                                            {reportStatus?.lastDailyReport ? formatDate(reportStatus.lastDailyReport.sentAt) : "Not logged yet"}
                                        </p>
                                        {reportStatus?.lastDailyReport?.success && (
                                            <p className="text-emerald-600 font-semibold flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> Delivered to {reportStatus.lastDailyReport.recipientsCount} recipient(s)
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        disabled={actionLoading}
                                        onClick={handleTriggerDaily}
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        Send Daily Report Now
                                    </button>
                                </div>

                                {/* Weekly Thursday Report */}
                                <div className="bg-card p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Thursday Comprehensive</span>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                            Thursday 8:00 AM
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        Runs Every Thursday at 8:00 AM WAT
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p><strong>Recipients:</strong> All active users & coslab.media@gmail.com</p>
                                        <p>
                                            <strong>Last Sent:</strong>{" "}
                                            {reportStatus?.lastWeeklyReport ? formatDate(reportStatus.lastWeeklyReport.sentAt) : "Not logged yet"}
                                        </p>
                                        {reportStatus?.lastWeeklyReport?.success && (
                                            <p className="text-emerald-600 font-semibold flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> Delivered to {reportStatus.lastWeeklyReport.recipientsCount} recipient(s)
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        disabled={actionLoading}
                                        onClick={handleTriggerWeekly}
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        Send Thursday Report Now
                                    </button>
                                </div>

                                {/* Real-Time Visitor Alerts */}
                                <div className="bg-card p-5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Visitor Arrival Alerts</span>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                            Real-Time Live
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        Instant IP Arrival Notifications
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p><strong>Alert Destination:</strong> coslab.media@gmail.com & Admins</p>
                                        <p><strong>Trigger:</strong> Dispatches immediately when an IP visits the platform.</p>
                                        <p className="text-emerald-600 font-semibold flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Live & Protected with Smart Debounce
                                        </p>
                                    </div>
                                    <button
                                        disabled={actionLoading}
                                        onClick={handleTestAlert}
                                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                        Send Test Visitor IP Alert
                                    </button>
                                </div>
                            </div>

                            {/* Sent Reports Execution Log */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-base text-foreground">Past Email Reports & Alert History</h4>
                                    <span className="text-xs text-muted-foreground">Persistent MongoDB Log</span>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-semibold">Report Type</th>
                                                <th className="text-left px-4 py-3 font-semibold">Date Key</th>
                                                <th className="text-center px-4 py-3 font-semibold">Status</th>
                                                <th className="text-center px-4 py-3 font-semibold">Recipients</th>
                                                <th className="text-left px-4 py-3 font-semibold">Sent At (WAT)</th>
                                                <th className="text-left px-4 py-3 font-semibold">Message ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {reportLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                                        No reports logged yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                reportLogs.map((r, i) => (
                                                    <tr key={i} className="hover:bg-muted/30">
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                                                r.reportType === "daily"
                                                                    ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                                                                    : r.reportType === "weekly"
                                                                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                                                                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                                            }`}>
                                                                {r.reportType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono font-medium">{r.dateKey || "—"}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {r.success ? (
                                                                <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                                                                    <CheckCircle className="w-3 h-3" /> Success
                                                                </span>
                                                            ) : (
                                                                <span className="text-rose-600 font-bold flex items-center justify-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3" /> Failed
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-semibold">{r.recipientsCount || 0}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{formatDate(r.sentAt)}</td>
                                                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground truncate max-w-xs">{r.messageId || "—"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
