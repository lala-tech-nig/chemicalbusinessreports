"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    Kanban,
    BarChart3,
    Receipt,
    User,
    LogOut,
    Shield,
    Sparkles,
    Flame,
    Layers,
    ArrowUpRight,
} from "lucide-react";
import { getMe } from "@/lib/api";

export default function StaffLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState({
        username: "Staff Member",
        photo: "",
        role: "staff",
        id: "",
        department: "General",
        fullName: "",
    });
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    const isLoginPage = pathname === "/staff/login";

    useEffect(() => {
        if (isLoginPage) {
            setLoading(false);
            return;
        }

        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("adminToken") ||
                  localStorage.getItem("staffToken") ||
                  localStorage.getItem("token")
                : null;

        if (!token) {
            router.push("/staff/login");
            return;
        }

        getMe()
            .then((data) => {
                if (data) {
                    setUser({
                        username: data.username || "Staff",
                        fullName: data.fullName || data.username || "Staff Member",
                        photo: data.profilePhoto || "",
                        role: data.role || "staff",
                        id: data._id,
                        department: data.department || "General",
                    });
                    setAuthorized(true);
                }
            })
            .catch((err) => {
                console.error("Auth error:", err);
                localStorage.removeItem("adminToken");
                localStorage.removeItem("staffToken");
                router.push("/staff/login");
            })
            .finally(() => setLoading(false));
    }, [pathname, isLoginPage, router]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("staffToken");
        localStorage.removeItem("token");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("adminPhoto");
        router.push("/staff/login");
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-600">Loading Staff Workspace...</p>
                </div>
            </div>
        );
    }

    if (!authorized) return null;

    const navLinks = [
        { name: "Daily Kanban", href: "/staff", icon: Kanban },
        { name: "Performance & Leaderboard", href: "/staff/analytics", icon: BarChart3 },
        { name: "Petty Cash Claims", href: "/staff/petty-cash", icon: Receipt },
    ];

    const isAdmin = user.role === "admin" || user.role === "moderator";

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
            {/* Top Workspace Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Logo & Portal Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-base tracking-tight text-slate-900">
                                        Staff Portal
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                        Performance Hub
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 hidden sm:block">
                                    Chemical Business Reports
                                </p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                            {navLinks.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    item.href === "/staff"
                                        ? pathname === "/staff"
                                        : pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-white text-indigo-600 shadow-xs font-semibold"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile & Actions */}
                        <div className="flex items-center gap-3">
                            {/* Switch to Admin Dashboard if admin */}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors shadow-xs"
                                >
                                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Admin Panel</span>
                                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                                </Link>
                            )}

                            {/* User Pill */}
                            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                {user.photo ? (
                                    <img
                                        src={user.photo}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-xs">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="hidden lg:flex flex-col text-left">
                                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                                        {user.fullName || user.username}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        {user.department || user.role}
                                    </span>
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Sub-bar */}
                    <div className="md:hidden flex items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
                        {navLinks.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.href === "/staff"
                                    ? pathname === "/staff"
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-xs font-semibold"
                                            : "text-slate-600 bg-slate-100"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-amber-800 bg-amber-50 border border-amber-200"
                            >
                                <Shield className="w-3.5 h-3.5" />
                                <span>Admin Panel</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
