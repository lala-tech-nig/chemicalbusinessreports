"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Layers, ArrowRight, ShieldAlert } from "lucide-react";
import { login } from "@/lib/api";

export default function StaffLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login({ email, password });

            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("staffToken", data.token);
            localStorage.setItem("adminRole", data.role);
            localStorage.setItem("adminId", data._id);
            localStorage.setItem("adminUsername", data.username);
            localStorage.setItem("adminPhoto", data.profilePhoto || "");

            router.push("/staff");
        } catch (err) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
            <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
                        <Layers className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Staff Performance Hub
                    </h2>
                    <p className="text-sm text-slate-500">
                        Sign in with your account to track daily tasks, petty cash & performance
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Email Address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Sign In to Staff Hub</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400">
                        Chemical Business Reports • Internal Performance System
                    </p>
                </div>
            </div>
        </div>
    );
}
