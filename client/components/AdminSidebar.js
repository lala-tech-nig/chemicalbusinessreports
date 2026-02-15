"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Settings, Users, LogOut, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "All Posts", href: "/admin/posts", icon: FileText },
    { name: "Create Post", href: "/admin/create-post", icon: PlusCircle },
    { name: "Ads", href: "/admin/ads", icon: Megaphone },
    { name: "Comments", href: "/admin/comments", icon: FileText },
    { name: "Submissions", href: "/admin/submissions", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [role, setRole] = useState("admin");

    useEffect(() => {
        const storedRole = localStorage.getItem("adminRole");
        if (storedRole) setRole(storedRole);
    }, []);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminRole");
            window.location.href = "/admin/login"; // Hard redirect to ensure state clear
        }
    };

    const filteredLinks = sidebarLinks.filter(link => {
        if (role === 'moderator') {
            // Moderators: No Ads, Users, Settings
            return ["Dashboard", "All Posts", "Create Post"].includes(link.name);
        }
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

            <div className="p-4 border-t border-border">
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
