"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Settings,
    Users,
    LogOut,
    Megaphone,
    User,
    Globe,
    BarChart2,
    MessageSquare,
    Kanban,
    Receipt,
    Wallet,
    Trophy,
    ArrowUpRight,
    Video,
    Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProvider, useUser } from "@/context/UserContext";

// permissionKey must match a key in ALL_DASHBOARD_SECTIONS from UserPermissionsModal
const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permissionKey: "overview" },
    { name: "YouTube Hub", href: "/admin/youtube", icon: Youtube, permissionKey: "youtube" },
    { name: "Voice Meetings", href: "/admin/meetings", icon: Video, permissionKey: "meetings" },
    { name: "Staff Tasks & Kanban", href: "/admin/staff-tracker", icon: Kanban, permissionKey: "staff-tracker" },
    { name: "Staff Performance", href: "/admin/staff-performance", icon: Trophy, permissionKey: "staff-performance" },
    { name: "Petty Cash Requests", href: "/admin/petty-cash", icon: Receipt, permissionKey: "petty-cash" },
    { name: "Finance & Accounts", href: "/admin/finances", icon: Wallet, permissionKey: "finances", adminOnly: true },
    { name: "All Posts", href: "/admin/posts", icon: FileText, permissionKey: "posts" },
    { name: "Create Post", href: "/admin/create-post", icon: PlusCircle, permissionKey: "create-post" },
    { name: "Auto Scraper", href: "/admin/scraper", icon: Globe, permissionKey: "scraper" },
    { name: "Ads", href: "/admin/ads", icon: Megaphone, permissionKey: "ads" },
    { name: "ChemTalk Moderation", href: "/admin/chemtalk", icon: MessageSquare, permissionKey: "chemtalk" },
    { name: "Comments", href: "/admin/comments", icon: FileText, permissionKey: "comments" },
    { name: "Submissions", href: "/admin/submissions", icon: FileText, permissionKey: "submissions" },
    { name: "Executive Profiles", href: "/admin/executive-profiles", icon: Users, permissionKey: "executive-profiles" },
    { name: "Users", href: "/admin/users", icon: Users, permissionKey: "users" },
    { name: "Detailed Report", href: "/admin/analytics", icon: BarChart2, permissionKey: "analytics", adminOnly: true },
    { name: "Settings", href: "/admin/settings", icon: Settings, permissionKey: "settings" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const role = user.role || "admin";
    // dashboardPermissions from the logged-in user (fetched via getMe in admin layout)
    const userPerms = user.dashboardPermissions; // null = use role defaults

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminRole");
            window.location.href = "/admin/login";
        }
    };

    const filteredLinks = sidebarLinks.filter(link => {
        // 1. If admin-set per-user permissions exist, use them
        if (userPerms && Array.isArray(userPerms) && userPerms.length > 0) {
            return userPerms.includes(link.permissionKey);
        }

        // 2. Fall back to role-based defaults
        if (role === "moderator") {
            return ["overview", "posts", "create-post", "chemtalk", "comments", "submissions"].includes(link.permissionKey);
        }

        // 3. Admin-only links hidden from non-admins
        if (link.adminOnly && role !== "admin") return false;

        return true;
    });

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border space-y-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-muted/50 rounded-xl border border-border/50">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        {user.photo ? (
                            <img src={user.photo} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-primary" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate leading-none mb-1">{user.username}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{role}</span>
                    </div>
                </div>

                <Link
                    href="/staff"
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors border border-indigo-200/60 shadow-xs"
                >
                    <div className="flex items-center gap-2">
                        <Kanban className="w-4 h-4 text-indigo-600" />
                        <span>Staff Portal View</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
