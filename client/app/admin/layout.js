"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { User } from "lucide-react";
import { getMe } from "@/lib/api";
import { UserProvider, useUser } from "@/context/UserContext";

function AdminLayoutContent({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const { user, updateUser } = useUser();
    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoginPage) return;

        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin/login");
        } else {
            setAuthorized(true);

            // Fetch latest from server on mount and every navigation
            getMe()
                .then(data => {
                    if (data && data.username) {
                        const latestPhoto = data.profilePhoto || "";
                        const latestUsername = data.username;
                        const latestId = data._id;

                        // Always update context; UserProvider handles storage sync if needed
                        updateUser({
                            username: latestUsername,
                            photo: latestPhoto,
                            id: latestId,
                            role: data.role
                        });
                    }
                })
                .catch(err => {
                    console.error("Profile sync failed", err);
                    if (err.message.includes("401") || err.message.includes("token")) {
                        handleLogout();
                    }
                });
        }
    }, [router, isLoginPage, pathname]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("adminPhoto");
        router.push("/admin/login");
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!authorized) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-muted/20">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <header className="bg-background border-b border-border h-16 flex items-center justify-between px-8 shadow-sm">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        {user.photo ? (
                            <img
                                src={user.photo}
                                alt={user.username}
                                className="w-8 h-8 rounded-full object-cover border border-border shadow-sm"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                        <span className="text-sm font-medium">{user.username}</span>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <UserProvider>
            <AdminLayoutContent>
                {children}
            </AdminLayoutContent>
        </UserProvider>
    );
}
