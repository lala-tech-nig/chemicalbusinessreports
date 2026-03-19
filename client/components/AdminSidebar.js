"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Settings, Users, LogOut, Megaphone, User, Globe, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "All Posts", href: "/admin/posts", icon: FileText },
    { name: "Create Post", href: "/admin/create-post", icon: PlusCircle },
    { name: "Auto Scraper", href: "/admin/scraper", icon: Globe },
    { name: "Ads", href: "/admin/ads", icon: Megaphone },
    { name: "Comments", href: "/admin/comments", icon: FileText },
    { name: "Submissions", href: "/admin/submissions", icon: FileText },
    { name: "Executive Profiles", href: "/admin/executive-profiles", icon: Users },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Detailed Report", href: "/admin/analytics", icon: BarChart2, adminOnly: true },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

import { UserProvider, useUser } from "@/context/UserContext";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const role = user.role || "admin";


    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminRole");
            window.location.href = "/admin/login"; // Hard redirect to ensure state clear
        }
    };

    const filteredLinks = sidebarLinks.filter(link => {
        if (role === 'moderator') {
            // Moderators: No Ads, Users, Settings, Analytics
            return ["Dashboard", "All Posts", "Create Post"].includes(link.name);
        }
        // Admin-only links hidden from non-admins
        if (link.adminOnly && role !== 'admin') return false;
        return true;
    });

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
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
