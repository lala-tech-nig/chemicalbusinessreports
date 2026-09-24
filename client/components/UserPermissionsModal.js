"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, Check, RotateCcw, Loader2 } from "lucide-react";
import { updateUserPermissions } from "@/lib/api";
import { toast } from "sonner";

// All available dashboard sections
export const ALL_DASHBOARD_SECTIONS = [
    { key: "overview", label: "Dashboard Overview", desc: "Main stats and metrics overview" },
    { key: "youtube", label: "YouTube Videos", desc: "Publish, edit, delete YouTube video posts" },
    { key: "posts", label: "Posts Management", desc: "Create, edit, delete articles" },
    { key: "create-post", label: "Create Post", desc: "Write and publish new articles" },
    { key: "users", label: "User Management", desc: "Manage admin/staff accounts" },
    { key: "analytics", label: "Analytics", desc: "Traffic and engagement reports" },
    { key: "finances", label: "Finances", desc: "Financial transactions & records" },
    { key: "petty-cash", label: "Petty Cash", desc: "Petty cash log and tracking" },
    { key: "ads", label: "Advertisements", desc: "Manage platform ads" },
    { key: "comments", label: "Comments", desc: "Moderate user comments" },
    { key: "submissions", label: "Submissions", desc: "Article & media submissions" },
    { key: "meetings", label: "Meetings", desc: "Staff meeting scheduler" },
    { key: "staff-performance", label: "Staff Performance", desc: "KPI & performance tracker" },
    { key: "staff-tracker", label: "Staff Tracker", desc: "Staff activity & time tracking" },
    { key: "executive-profiles", label: "Executive Profiles", desc: "Manage exec profile forms" },
    { key: "chemtalk", label: "ChemTalk Moderation", desc: "Community posts & members" },
    { key: "scraper", label: "Content Scraper", desc: "Auto-scrape news sources" },
    { key: "settings", label: "Settings", desc: "Platform configuration" },
];

export default function UserPermissionsModal({ user, onClose, onSaved }) {
    const [selected, setSelected] = useState(() =>
        user.dashboardPermissions && user.dashboardPermissions.length > 0
            ? new Set(user.dashboardPermissions)
            : new Set(ALL_DASHBOARD_SECTIONS.map(s => s.key)) // default = all sections
    );
    const [saving, setSaving] = useState(false);

    const toggle = (key) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const selectAll = () => setSelected(new Set(ALL_DASHBOARD_SECTIONS.map(s => s.key)));
    const selectNone = () => setSelected(new Set());

    const handleSave = async () => {
        setSaving(true);
        try {
            const permissions = [...selected];
            await updateUserPermissions(user._id, permissions.length === ALL_DASHBOARD_SECTIONS.length ? null : permissions);
            toast.success(`Permissions updated for ${user.username}`);
            onSaved?.();
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to save permissions");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        setSaving(true);
        try {
            await updateUserPermissions(user._id, null); // null = role defaults
            toast.success(`Permissions reset to role defaults for ${user.username}`);
            setSelected(new Set(ALL_DASHBOARD_SECTIONS.map(s => s.key)));
            onSaved?.();
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to reset permissions");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Settings2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-base">Dashboard Permissions</h2>
                                <p className="text-xs text-gray-500">@{user.username} · {user.role}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 px-6 pt-4 pb-2">
                        <span className="text-xs text-gray-500 font-medium">Quick select:</span>
                        <button onClick={selectAll} className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">All Sections</button>
                        <button onClick={selectNone} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium">None</button>
                        <span className="ml-auto text-xs text-gray-400">{selected.size} / {ALL_DASHBOARD_SECTIONS.length} enabled</span>
                    </div>

                    {/* Checklist */}
                    <div className="px-6 pb-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ALL_DASHBOARD_SECTIONS.map(section => {
                                const checked = selected.has(section.key);
                                return (
                                    <label
                                        key={section.key}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                                            checked
                                                ? "border-blue-200 bg-blue-50"
                                                : "border-gray-100 bg-gray-50 hover:border-gray-200"
                                        }`}
                                    >
                                        <div
                                            onClick={() => toggle(section.key)}
                                            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 cursor-pointer ${
                                                checked ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                            }`}
                                        >
                                            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold leading-tight ${checked ? "text-blue-800" : "text-gray-700"}`}>
                                                {section.label}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{section.desc}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save Permissions
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset to Defaults
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
