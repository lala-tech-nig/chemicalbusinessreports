"use client";

import { useEffect, useState } from "react";
import {
    Trophy,
    TrendingUp,
    Flame,
    CheckCircle2,
    Clock,
    AlertTriangle,
    BarChart2,
    Calendar,
    Award,
    User,
    ChevronRight,
    ArrowUpRight,
    Target,
    Layers,
    Percent,
} from "lucide-react";
import { fetchStaffLeaderboard, fetchStaffInfographics, fetchUsers } from "@/lib/api";

export default function StaffPerformanceAnalytics() {
    const [period, setPeriod] = useState("today"); // "today", "week", "month"
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [infographicsData, setInfographicsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [peerInfographics, setPeerInfographics] = useState(null);
    const [loadingPeer, setLoadingPeer] = useState(false);

    const currentUserId = typeof window !== "undefined" ? localStorage.getItem("adminId") : "";

    const loadData = async () => {
        try {
            setLoading(true);
            const [lb, info] = await Promise.all([
                fetchStaffLeaderboard(period),
                fetchStaffInfographics(),
            ]);
            setLeaderboardData(lb);
            setInfographicsData(info);
        } catch (err) {
            console.error("Error loading analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [period]);

    // Inspect peer details
    const handleSelectPeer = async (peerUser) => {
        setSelectedPeer(peerUser);
        try {
            setLoadingPeer(true);
            const data = await fetchStaffInfographics(peerUser._id);
            setPeerInfographics(data);
        } catch (err) {
            console.error("Error loading peer infographics:", err);
        } finally {
            setLoadingPeer(false);
        }
    };

    if (loading && !leaderboardData) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500">Calculating performance metrics...</p>
            </div>
        );
    }

    const leaderboard = leaderboardData?.leaderboard || [];
    const topThree = leaderboard.slice(0, 3);
    const todayStats = infographicsData?.today || { total: 0, completed: 0, completionRate: 0 };
    const dailyTrend = infographicsData?.dailyTrend || [];
    const streak = infographicsData?.streak || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Period Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <span>Staff Performance & Activity Leaderboard</span>
                        <Trophy className="w-6 h-6 text-amber-500" />
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Live breakdown of activity scores, task completion velocity, and team standings.
                    </p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setPeriod("today")}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            period === "today"
                                ? "bg-white text-indigo-600 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setPeriod("week")}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            period === "week"
                                ? "bg-white text-indigo-600 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        This Week
                    </button>
                    <button
                        onClick={() => setPeriod("month")}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            period === "month"
                                ? "bg-white text-indigo-600 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        This Month
                    </button>
                </div>
            </div>

            {/* Infographics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate Gauge */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            My Completion Rate
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                            <Percent className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2 my-3">
                        <span className="text-4xl font-extrabold text-slate-900">
                            {todayStats.completionRate}%
                        </span>
                        <span className="text-xs font-semibold text-emerald-600">
                            ({todayStats.completed}/{todayStats.total} done)
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(todayStats.completionRate, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Active Daily Streak */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Daily Activity Streak
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                            <Flame className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2 my-3">
                        <span className="text-4xl font-extrabold text-amber-600">{streak}</span>
                        <span className="text-sm font-semibold text-slate-600">Days Active</span>
                    </div>

                    <p className="text-xs text-slate-500">
                        Consecutive days with logged & completed activities.
                    </p>
                </div>

                {/* Total Completed All-Time */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            All-Time Completed
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2 my-3">
                        <span className="text-4xl font-extrabold text-indigo-600">
                            {infographicsData?.totalCompletedAllTime || 0}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Tasks</span>
                    </div>

                    <p className="text-xs text-slate-500">
                        Cumulative tasks completed since joining.
                    </p>
                </div>

                {/* Team Standing */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Team Participation
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                            <Target className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2 my-3">
                        <span className="text-4xl font-extrabold text-slate-900">
                            {leaderboardData?.summary?.activeToday || 0} /{" "}
                            {leaderboardData?.summary?.totalMembers || 0}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Staff Active</span>
                    </div>

                    <p className="text-xs text-slate-500">
                        {leaderboardData?.summary?.totalCompleted || 0} tasks completed across the company.
                    </p>
                </div>
            </div>

            {/* 7-Day Velocity Infographic Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            7-Day Task Completion Velocity
                        </h3>
                        <p className="text-xs text-slate-500">
                            Your daily output over the last 7 days.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-xs bg-emerald-500"></div>
                            <span className="text-slate-600 font-medium">Completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-xs bg-amber-400"></div>
                            <span className="text-slate-600 font-medium">In Progress</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-xs bg-slate-300"></div>
                            <span className="text-slate-600 font-medium">To Do</span>
                        </div>
                    </div>
                </div>

                {/* SVG Visual Bar Chart */}
                <div className="pt-6 pb-2">
                    <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-48 border-b border-slate-200 px-2">
                        {dailyTrend.map((d, i) => {
                            const maxVal = Math.max(
                                ...dailyTrend.map((item) => item.total || 0),
                                5
                            );
                            const compHeight = ((d.completed || 0) / maxVal) * 100;
                            const inProgHeight = ((d.inProgress || 0) / maxVal) * 100;
                            const todoHeight = ((d.todo || 0) / maxVal) * 100;

                            return (
                                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full max-w-[42px] flex flex-col justify-end items-center gap-0.5 h-full">
                                        {/* Tooltip on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white rounded-md px-1.5 py-0.5 whitespace-nowrap mb-1 shadow-md">
                                            {d.completed} done / {d.total} tot
                                        </div>

                                        {/* Stacked bars */}
                                        <div
                                            className="w-full bg-slate-300 rounded-t-sm transition-all"
                                            style={{ height: `${todoHeight}%` }}
                                        ></div>
                                        <div
                                            className="w-full bg-amber-400 transition-all"
                                            style={{ height: `${inProgHeight}%` }}
                                        ></div>
                                        <div
                                            className="w-full bg-emerald-500 rounded-b-sm transition-all shadow-xs"
                                            style={{ height: `${compHeight}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600">
                                        {d.dayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top 3 Podium Cards */}
            {topThree.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-bold text-slate-900">
                            Activity Leaders ({period.toUpperCase()})
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topThree.map((item, idx) => {
                            const medalConfig = [
                                {
                                    bg: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-300",
                                    badge: "bg-amber-100 text-amber-800 border-amber-300",
                                    icon: "🥇 1st Place",
                                },
                                {
                                    bg: "from-slate-400/10 via-slate-400/5 to-transparent border-slate-300",
                                    badge: "bg-slate-100 text-slate-700 border-slate-300",
                                    icon: "🥈 2nd Place",
                                },
                                {
                                    bg: "from-amber-700/10 via-amber-700/5 to-transparent border-amber-700/30",
                                    badge: "bg-amber-100/70 text-amber-900 border-amber-600/30",
                                    icon: "🥉 3rd Place",
                                },
                            ][idx];

                            return (
                                <div
                                    key={item.user._id}
                                    onClick={() => handleSelectPeer(item.user)}
                                    className={`bg-white rounded-2xl p-5 border bg-gradient-to-b ${medalConfig.bg} shadow-xs hover:shadow-md transition-all cursor-pointer space-y-4`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${medalConfig.badge}`}
                                        >
                                            {medalConfig.icon}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">
                                            Score: {item.activityScore} pts
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {item.user?.profilePhoto ? (
                                            <img
                                                src={item.user.profilePhoto}
                                                alt={item.user.username}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                                                {item.user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-base text-slate-900">
                                                {item.user?.fullName || item.user?.username}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {item.user?.department || item.user?.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                        <div>
                                            <span className="text-slate-400">Completed:</span>
                                            <span className="font-bold text-slate-800 ml-1">
                                                {item.completed} tasks
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Rate:</span>
                                            <span className="font-bold text-emerald-600 ml-1">
                                                {item.completionRate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Complete Team Roster & Leaderboard Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            Full Company Performance Roster
                        </h3>
                        <p className="text-xs text-slate-500">
                            Real-time standings showing who is leading activities and who is lagging behind. Click any colleague to view details.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">Rank</th>
                                <th className="py-3 px-4">Staff Member</th>
                                <th className="py-3 px-4">Department</th>
                                <th className="py-3 px-4 text-center">Tasks Logged</th>
                                <th className="py-3 px-4 text-center">Completed</th>
                                <th className="py-3 px-4 text-center">In Progress</th>
                                <th className="py-3 px-4 text-center">Support SOS</th>
                                <th className="py-3 px-4 text-center">Rate</th>
                                <th className="py-3 px-4 text-center">Activity Score</th>
                                <th className="py-3 px-4 text-right">Status Standing</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaderboard.map((row) => {
                                const isSelf = row.user._id === currentUserId;

                                return (
                                    <tr
                                        key={row.user._id}
                                        onClick={() => handleSelectPeer(row.user)}
                                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                            isSelf ? "bg-indigo-50/40" : ""
                                        }`}
                                    >
                                        <td className="py-3.5 px-4 font-bold text-slate-700">
                                            #{row.rank}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                {row.user?.profilePhoto ? (
                                                    <img
                                                        src={row.user.profilePhoto}
                                                        alt={row.user.username}
                                                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                                        {row.user?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-slate-900">
                                                            {row.user?.fullName || row.user?.username}
                                                        </span>
                                                        {isSelf && (
                                                            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">
                                                        @{row.user?.username}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                                            {row.user?.department || "General"}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                            {row.totalTasks}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                                            {row.completed}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-semibold text-amber-600">
                                            {row.inProgress}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                                            {row.adminSupport}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                                            {row.completionRate}%
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-extrabold text-indigo-600">
                                            {row.activityScore}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
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
                                                    ⚠️ Lagging Behind
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Peer Performance Inspector Drawer */}
            {selectedPeer && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
                    <div className="bg-white max-w-md w-full h-full p-6 shadow-2xl overflow-y-auto border-l border-slate-200 space-y-6 animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Colleague Performance Card
                            </span>
                            <button
                                onClick={() => setSelectedPeer(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {selectedPeer.profilePhoto ? (
                                <img
                                    src={selectedPeer.profilePhoto}
                                    alt={selectedPeer.username}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center">
                                    {selectedPeer.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">
                                    {selectedPeer.fullName || selectedPeer.username}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {selectedPeer.department || "General"} • {selectedPeer.role}
                                </p>
                            </div>
                        </div>

                        {loadingPeer ? (
                            <div className="py-12 text-center text-slate-400 text-xs">
                                Loading stats...
                            </div>
                        ) : peerInfographics ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[11px] text-slate-500">Today's Tasks</span>
                                        <p className="text-xl font-bold text-slate-900 mt-1">
                                            {peerInfographics.today?.total || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[11px] text-slate-500">Completed</span>
                                        <p className="text-xl font-bold text-emerald-600 mt-1">
                                            {peerInfographics.today?.completed || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[11px] text-slate-500">Active Streak</span>
                                        <p className="text-xl font-bold text-amber-600 mt-1">
                                            🔥 {peerInfographics.streak || 0} days
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[11px] text-slate-500">All-Time Done</span>
                                        <p className="text-xl font-bold text-indigo-600 mt-1">
                                            {peerInfographics.totalCompletedAllTime || 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        7-Day Activity Trend
                                    </h4>
                                    <div className="space-y-1.5">
                                        {peerInfographics.dailyTrend?.map((d, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg"
                                            >
                                                <span className="font-semibold text-slate-700">
                                                    {d.dayName} ({d.date})
                                                </span>
                                                <span className="text-slate-600">
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
