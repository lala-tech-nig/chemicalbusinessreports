"use client";

import { useEffect, useState } from "react";
import {
    Trophy,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Award,
    BarChart3,
    CheckCircle2,
    Clock,
    Users,
    User,
    ChevronRight,
    RefreshCw,
    Shield,
    Target,
} from "lucide-react";
import { fetchStaffLeaderboard, fetchStaffInfographics } from "@/lib/api";

export default function AdminStaffPerformance() {
    const [period, setPeriod] = useState("today");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);
    const [staffInfographics, setStaffInfographics] = useState(null);
    const [loadingInfographics, setLoadingInfographics] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetchStaffLeaderboard(period);
            setData(res);
        } catch (err) {
            console.error("Error loading staff performance for admin:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [period]);

    const handleInspectStaff = async (staffUser) => {
        setSelectedStaffDetails(staffUser);
        try {
            setLoadingInfographics(true);
            const info = await fetchStaffInfographics(staffUser._id);
            setStaffInfographics(info);
        } catch (err) {
            console.error("Error loading staff infographics:", err);
        } finally {
            setLoadingInfographics(false);
        }
    };

    const leaderboard = data?.leaderboard || [];
    const summary = data?.summary || { totalMembers: 0, activeToday: 0, totalCompleted: 0, totalTasks: 0 };
    const leadingStaff = leaderboard.filter((s) => s.standing === "leading" || s.standing === "progressing");
    const laggingStaff = leaderboard.filter((s) => s.standing === "behind");

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-border shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span>Staff Performance & Activity Executive Suite</span>
                        <Trophy className="w-6 h-6 text-amber-500" />
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Executive analytics tracking who is leading in company activities, who is falling behind, and task execution velocity.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
                        {["today", "week", "month"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                                    period === p
                                        ? "bg-card text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={loadData}
                        className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-accent"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Staff Participation
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-foreground">
                            {summary.activeToday} / {summary.totalMembers}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {summary.totalMembers > 0
                                ? Math.round((summary.activeToday / summary.totalMembers) * 100)
                                : 0}
                            % Active
                        </span>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Total Tasks Logged
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-foreground">
                            {summary.totalTasks}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                            Activity
                        </span>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Tasks Completed
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-emerald-600">
                            {summary.totalCompleted}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {summary.totalTasks > 0
                                ? Math.round((summary.totalCompleted / summary.totalTasks) * 100)
                                : 0}
                            % Rate
                        </span>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Needs Attention / Behind
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold text-rose-600">
                            {laggingStaff.length} Staff
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            Lagging
                        </span>
                    </div>
                </div>
            </div>

            {/* Split View: Leading Performers VS Lagging Behind Attention Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leading Performers */}
                <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🚀</span>
                            <h3 className="text-sm font-bold text-foreground">
                                Leading in Activities & Output ({leadingStaff.length})
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            High Productivity
                        </span>
                    </div>

                    <div className="space-y-2">
                        {leadingStaff.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-6 text-center">
                                No activity recorded for this period yet.
                            </p>
                        ) : (
                            leadingStaff.map((staff) => (
                                <div
                                    key={staff.user._id}
                                    onClick={() => handleInspectStaff(staff.user)}
                                    className="p-3 bg-muted/20 hover:bg-muted/40 rounded-lg border border-border flex items-center justify-between transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                                            #{staff.rank}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-foreground block">
                                                {staff.user?.fullName || staff.user?.username}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {staff.user?.department || "General"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-xs font-extrabold text-foreground block">
                                            {staff.completed} of {staff.totalTasks} Done
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600">
                                            Score: {staff.activityScore} pts
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Lagging Behind Staff Box */}
                <div className="bg-card p-5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <h3 className="text-sm font-bold text-rose-950">
                                Needs Push / Lagging Behind ({laggingStaff.length})
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded border border-rose-300">
                            Low Activity
                        </span>
                    </div>

                    <div className="space-y-2">
                        {laggingStaff.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-6 text-center">
                                Great news! All staff members are active and on schedule.
                            </p>
                        ) : (
                            laggingStaff.map((staff) => (
                                <div
                                    key={staff.user._id}
                                    onClick={() => handleInspectStaff(staff.user)}
                                    className="p-3 bg-white hover:bg-rose-50/40 rounded-lg border border-rose-200/80 flex items-center justify-between transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                                            #{staff.rank}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">
                                                {staff.user?.fullName || staff.user?.username}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {staff.user?.department || "General"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-xs font-bold text-rose-700 block">
                                            {staff.totalTasks === 0
                                                ? "0 Tasks Logged"
                                                : `${staff.completed}/${staff.totalTasks} Completed`}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            Rate: {staff.completionRate}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Complete Staff Performance Table */}
            <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                <div className="p-5 border-b border-border">
                    <h3 className="text-base font-bold text-foreground">
                        Company Staff Activity Leaderboard
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Rankings calculated based on task volume, completion rate, and speed.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">Rank</th>
                                <th className="py-3 px-4">Staff Member</th>
                                <th className="py-3 px-4">Department</th>
                                <th className="py-3 px-4 text-center">Tasks Logged</th>
                                <th className="py-3 px-4 text-center">Done</th>
                                <th className="py-3 px-4 text-center">In Progress</th>
                                <th className="py-3 px-4 text-center">Support SOS</th>
                                <th className="py-3 px-4 text-center">Completion Rate</th>
                                <th className="py-3 px-4 text-center">Activity Score</th>
                                <th className="py-3 px-4 text-right">Standing</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {leaderboard.map((row) => (
                                <tr
                                    key={row.user._id}
                                    onClick={() => handleInspectStaff(row.user)}
                                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                                >
                                    <td className="py-3 px-4 font-bold text-foreground">
                                        #{row.rank}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {row.user?.profilePhoto ? (
                                                <img
                                                    src={row.user.profilePhoto}
                                                    alt={row.user.username}
                                                    className="w-6 h-6 rounded-full object-cover border border-border"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center">
                                                    {row.user?.username?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-semibold text-foreground block">
                                                    {row.user?.fullName || row.user?.username}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    @{row.user?.username}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {row.user?.department || "General"}
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-foreground">
                                        {row.totalTasks}
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-emerald-600">
                                        {row.completed}
                                    </td>
                                    <td className="py-3 px-4 text-center text-amber-600 font-semibold">
                                        {row.inProgress}
                                    </td>
                                    <td className="py-3 px-4 text-center text-rose-600 font-semibold">
                                        {row.adminSupport}
                                    </td>
                                    <td className="py-3 px-4 text-center font-extrabold text-foreground">
                                        {row.completionRate}%
                                    </td>
                                    <td className="py-3 px-4 text-center font-extrabold text-indigo-600">
                                        {row.activityScore}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {row.standing === "leading" ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                🚀 Leading
                                            </span>
                                        ) : row.standing === "progressing" ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                🔥 On Track
                                            </span>
                                        ) : row.standing === "behind" ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                ⚠️ Behind
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Staff Inspector Drawer */}
            {selectedStaffDetails && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
                    <div className="bg-white max-w-md w-full h-full p-6 shadow-2xl overflow-y-auto border-l border-border space-y-6 animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Staff Member Executive Dossier
                            </span>
                            <button
                                onClick={() => setSelectedStaffDetails(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {selectedStaffDetails.profilePhoto ? (
                                <img
                                    src={selectedStaffDetails.profilePhoto}
                                    alt={selectedStaffDetails.username}
                                    className="w-14 h-14 rounded-full object-cover border border-border"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center">
                                    {selectedStaffDetails.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-lg text-foreground">
                                    {selectedStaffDetails.fullName || selectedStaffDetails.username}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {selectedStaffDetails.department || "General"} • {selectedStaffDetails.role}
                                </p>
                            </div>
                        </div>

                        {loadingInfographics ? (
                            <div className="py-12 text-center text-muted-foreground text-xs">
                                Loading stats...
                            </div>
                        ) : staffInfographics ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border">
                                        <span className="text-[11px] text-muted-foreground">Today's Total Tasks</span>
                                        <p className="text-xl font-bold text-foreground mt-1">
                                            {staffInfographics.today?.total || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border">
                                        <span className="text-[11px] text-muted-foreground">Completed</span>
                                        <p className="text-xl font-bold text-emerald-600 mt-1">
                                            {staffInfographics.today?.completed || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border">
                                        <span className="text-[11px] text-muted-foreground">Active Streak</span>
                                        <p className="text-xl font-bold text-amber-600 mt-1">
                                            🔥 {staffInfographics.streak || 0} days
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border">
                                        <span className="text-[11px] text-muted-foreground">All-Time Done</span>
                                        <p className="text-xl font-bold text-indigo-600 mt-1">
                                            {staffInfographics.totalCompletedAllTime || 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                        7-Day Activity Trend
                                    </h4>
                                    <div className="space-y-1.5">
                                        {staffInfographics.dailyTrend?.map((d, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between text-xs p-2 bg-muted/20 rounded-lg"
                                            >
                                                <span className="font-semibold text-foreground">
                                                    {d.dayName} ({d.date})
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {d.completed} done / {d.total} tasks
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
