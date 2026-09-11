"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, User, Building, BookOpen, Sparkles, Loader2, LogIn, UserPlus } from "lucide-react";
import { communityLogin, communityRegister } from "@/lib/api";
import { toast } from "sonner";

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = "login" }) {
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [loading, setLoading] = useState(false);

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [registerData, setRegisterData] = useState({
        fullName: "",
        username: "",
        email: "",
        affiliation: "",
        fieldOfStudy: "",
        password: "",
    });

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await communityLogin(loginData);
            localStorage.setItem("communityToken", data.token);
            localStorage.setItem("communityUser", JSON.stringify(data));
            window.dispatchEvent(new Event("communityAuthChange"));
            toast.success(`Welcome back, ${data.fullName || data.username}!`);
            if (onAuthSuccess) onAuthSuccess(data);
            onClose();
        } catch (err) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await communityRegister(registerData);
            localStorage.setItem("communityToken", data.token);
            localStorage.setItem("communityUser", JSON.stringify(data));
            window.dispatchEvent(new Event("communityAuthChange"));
            toast.success(`Account created! Welcome to ChemTalk, ${data.fullName}!`);
            if (onAuthSuccess) onAuthSuccess(data);
            onClose();
        } catch (err) {
            toast.error(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                >
                    {/* Header bar */}
                    <div className="relative bg-slate-900 text-white p-6 pb-8">
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                ChemTalk Community
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">
                            {mode === "login" ? "Sign in to ChemTalk" : "Join the Chemical Discourse"}
                        </h2>
                        <p className="text-xs text-blue-100/90 mt-1 max-w-sm">
                            {mode === "login"
                                ? "Publish chemical theses, raise sub-topics, debate industry trends, and comment."
                                : "Create your researcher or industry account to publish research and join discussions."}
                        </p>

                        {/* Mode switch tabs */}
                        <div className="flex bg-blue-950/40 p-1 rounded-xl mt-5 w-fit">
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    mode === "login" ? "bg-white text-blue-900 shadow-sm" : "text-blue-200 hover:text-white"
                                }`}
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("register")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    mode === "register" ? "bg-white text-blue-900 shadow-sm" : "text-blue-200 hover:text-white"
                                }`}
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                Register Account
                            </button>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
                        {mode === "login" ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Email or Username</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            value={loginData.email}
                                            onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                                            placeholder="you@domain.com or username"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Password</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            required
                                            value={loginData.password}
                                            onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                                    {loading ? "Signing in..." : "Sign In to Account"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700">Full Name / Title *</label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                required
                                                value={registerData.fullName}
                                                onChange={(e) => setRegisterData((prev) => ({ ...prev, fullName: e.target.value }))}
                                                placeholder="e.g. Dr. Jane Okonjo"
                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700">Username *</label>
                                        <input
                                            type="text"
                                            required
                                            value={registerData.username}
                                            onChange={(e) => setRegisterData((prev) => ({ ...prev, username: e.target.value }))}
                                            placeholder="e.g. j_okonjo"
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            required
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                                            placeholder="researcher@university.edu or you@company.com"
                                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700">Affiliation / Organization</label>
                                        <div className="relative">
                                            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={registerData.affiliation}
                                                onChange={(e) => setRegisterData((prev) => ({ ...prev, affiliation: e.target.value }))}
                                                placeholder="e.g. Unilag, Indorama, BASF"
                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700">Field of Specialization</label>
                                        <div className="relative">
                                            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={registerData.fieldOfStudy}
                                                onChange={(e) => setRegisterData((prev) => ({ ...prev, fieldOfStudy: e.target.value }))}
                                                placeholder="e.g. Petrochem, Cosmetic Chem"
                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">Create Password *</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                                            placeholder="At least 6 characters"
                                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    {loading ? "Creating Account..." : "Complete Registration"}
                                </button>
                            </form>
                        )}

                        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-500">
                                By joining ChemTalk, you agree to uphold scientific integrity and respectful peer dialogue.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
