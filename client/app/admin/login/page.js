"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, X, ShieldAlert } from "lucide-react"; // ShieldAlert or similar icon
import { login } from "@/lib/api";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showSuspendedModal, setShowSuspendedModal] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await login({ email, password });

            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("adminRole", data.role);
            router.push("/admin");
        } catch (err) {
            if (err.message === "Account suspended" || err.response?.status === 403) {
                setShowSuspendedModal(true);
            } else {
                setError(err.message || "Something went wrong.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to manage Chemical Business Reports
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none rounded-t-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none rounded-b-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>

            {/* Suspended User Modal */}
            {showSuspendedModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <ShieldAlert className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Account Suspended</h3>
                            <p className="text-gray-500">
                                There is an issue with your account status. For security reasons, your access has been temporarily restricted.
                            </p>
                            <p className="text-sm font-medium text-gray-900 bg-gray-100 px-4 py-2 rounded-lg w-full">
                                Please contact the Super Admin to resolve this issue.
                            </p>
                            <button
                                onClick={() => setShowSuspendedModal(false)}
                                className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                Close & Return to Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
