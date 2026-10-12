"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Megaphone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        siteName: "Chemical Business Reports",
        contactEmail: "info@chemicalbusinessreports.net",
        facebook: "",
        twitter: "",
        linkedin: ""
    });

    useEffect(() => {
        // Load from API or LocalStorage (for demo)
        // ideally GET /api/settings
        const saved = localStorage.getItem("siteSettings");
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        localStorage.setItem("siteSettings", JSON.stringify(formData));
        toast.success("Settings saved successfully!");
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
            </div>

            {/* Quick Link to Top Marquee Banner Controls */}
            <Link
                href="/admin/marquee"
                className="flex items-center justify-between p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-600 text-white shrink-0">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            Top Marquee & Ticker Banner
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Configure breaking news and autoscrolling announcements above navbar.
                        </p>
                    </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border pb-2">General</h2>
                    <div>
                        <label className="block text-sm font-medium mb-1">Site Name</label>
                        <input
                            type="text"
                            name="siteName"
                            value={formData.siteName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contact Email</label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-semibold border-b border-border pb-2">Social Links</h2>
                    <div>
                        <label className="block text-sm font-medium mb-1">Facebook URL</label>
                        <input
                            type="url"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Twitter/X URL</label>
                        <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="https://twitter.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                        <input
                            type="url"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="https://linkedin.com/..."
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
