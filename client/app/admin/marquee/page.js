"use client";

import { useState, useEffect } from "react";
import {
    Save,
    Loader2,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Eye,
    Sparkles,
    Megaphone,
    ExternalLink,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Gauge,
    Sliders,
    Palette,
    Layers,
    Info,
} from "lucide-react";
import { fetchMarqueeSettings, updateMarqueeSettings } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
    { id: "dark", label: "Midnight Dark", bgClass: "bg-slate-950 text-slate-100", borderClass: "border-slate-800" },
    { id: "blue", label: "Sapphire Blue", bgClass: "bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-blue-100", borderClass: "border-blue-800" },
    { id: "slate", label: "Slate Zinc", bgClass: "bg-zinc-900 text-zinc-100", borderClass: "border-zinc-800" },
    { id: "light", label: "Minimal Light", bgClass: "bg-slate-100 text-slate-900", borderClass: "border-slate-300" },
];

const BADGE_COLORS = [
    { id: "red", label: "Crimson Red", class: "bg-red-600 text-white ring-red-400" },
    { id: "blue", label: "Cobalt Blue", class: "bg-blue-600 text-white ring-blue-400" },
    { id: "amber", label: "Amber Gold", class: "bg-amber-500 text-slate-950 ring-amber-400" },
    { id: "emerald", label: "Forest Emerald", class: "bg-emerald-600 text-white ring-emerald-400" },
    { id: "purple", label: "Royal Purple", class: "bg-purple-600 text-white ring-purple-400" },
];

export default function AdminMarqueePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form settings
    const [isEnabled, setIsEnabled] = useState(true);
    const [label, setLabel] = useState("BREAKING NEWS");
    const [labelBg, setLabelBg] = useState("red");
    const [theme, setTheme] = useState("dark");
    const [speed, setSpeed] = useState(35);
    const [pauseOnHover, setPauseOnHover] = useState(true);
    const [includeLatestPosts, setIncludeLatestPosts] = useState(true);
    const [items, setItems] = useState([]);

    // New item draft input
    const [newItemText, setNewItemText] = useState("");
    const [newItemLink, setNewItemLink] = useState("");
    const [newItemBadge, setNewItemBadge] = useState("");

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchMarqueeSettings();
            if (data) {
                setIsEnabled(data.isEnabled !== false);
                setLabel(data.label || "BREAKING NEWS");
                setLabelBg(data.labelBg || "red");
                setTheme(data.theme || "dark");
                setSpeed(Number(data.speed) || 35);
                setPauseOnHover(data.pauseOnHover !== false);
                setIncludeLatestPosts(data.includeLatestPosts !== false);
                setItems(Array.isArray(data.items) ? data.items : []);
            }
        } catch (error) {
            console.error("Failed to fetch marquee settings:", error);
            toast.error("Failed to load marquee settings");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemText.trim()) {
            toast.error("Announcement text is required");
            return;
        }

        const newItem = {
            _id: `temp-${Date.now()}`,
            text: newItemText.trim(),
            link: newItemLink.trim(),
            badge: newItemBadge.trim().toUpperCase(),
            isActive: true,
        };

        setItems([...items, newItem]);
        setNewItemText("");
        setNewItemLink("");
        setNewItemBadge("");
        toast.success("Announcement added to list");
    };

    const handleToggleItemActive = (index) => {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            isActive: !updated[index].isActive,
        };
        setItems(updated);
    };

    const handleMoveItem = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= items.length) return;
        const updated = [...items];
        const temp = updated[index];
        updated[index] = updated[newIndex];
        updated[newIndex] = temp;
        setItems(updated);
    };

    const handleDeleteItem = (index) => {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
        toast.info("Item removed");
    };

    const handleUpdateItemField = (index, field, value) => {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        setItems(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                isEnabled,
                label: label.trim() || "BREAKING NEWS",
                labelBg,
                theme,
                speed: Number(speed) || 35,
                pauseOnHover,
                includeLatestPosts,
                items,
            };

            await updateMarqueeSettings(payload);
            toast.success("Marquee settings saved successfully!");
        } catch (error) {
            console.error("Failed to save marquee settings:", error);
            toast.error(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = () => {
        if (!confirm("Reset all marquee configurations to standard factory defaults?")) return;
        setIsEnabled(true);
        setLabel("BREAKING NEWS");
        setLabelBg("red");
        setTheme("dark");
        setSpeed(35);
        setPauseOnHover(true);
        setIncludeLatestPosts(true);
        setItems([
            {
                text: "Welcome to Chemical Business Reports — Africa & Global Chemical Market Intelligence.",
                link: "/",
                badge: "WELCOME",
                isActive: true,
            },
            {
                text: "Global Petrochemical & Industrial Trends 2026: Supply chain dynamics, pricing analysis, and policy briefs.",
                link: "/posts/research-reports",
                badge: "MARKET INSIGHT",
                isActive: true,
            },
            {
                text: "Explore Chemical Business Mart: Verified suppliers, chemicals, and laboratory equipment directory.",
                link: "/posts/chemical-mart",
                badge: "DIRECTORY",
                isActive: true,
            }
        ]);
        toast.info("Settings reset to defaults. Click 'Save Changes' to apply.");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Loading marquee configurations...</p>
            </div>
        );
    }

    const selectedThemeStyle = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
    const selectedBadgeStyle = BADGE_COLORS.find((b) => b.id === labelBg) || BADGE_COLORS[0];
    const activeItems = items.filter((item) => item.isActive);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Top Marquee & Ticker Banner
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Configure continuous autoscrolling announcements and news updates displayed above the website navbar.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="px-3.5 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-muted-foreground transition-colors flex items-center gap-1.5"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Live Visual Preview */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Eye className="w-4 h-4 text-primary" />
                        Live Interactive Banner Preview
                    </div>
                    <span
                        className={cn(
                            "px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5",
                            isEnabled ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                        )}
                    >
                        {isEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isEnabled ? "Live on Website" : "Disabled (Hidden)"}
                    </span>
                </div>

                <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-card">
                    {/* Simulated Header Frame */}
                    <div className="bg-muted/40 px-3 py-1.5 border-b border-border text-[11px] text-muted-foreground flex items-center justify-between">
                        <span className="font-mono text-[10px]">PREVIEW POSITION: &lt;TopMarquee /&gt; Above Navigation</span>
                        <span>Speed: {speed}s | Hover: {pauseOnHover ? "Pause" : "Continue"}</span>
                    </div>

                    {/* Preview Marquee */}
                    {isEnabled ? (
                        <div
                            className={cn(
                                "relative w-full border-b text-xs overflow-hidden select-none ticker-container py-1.5 px-3 transition-colors",
                                selectedThemeStyle.bgClass,
                                selectedThemeStyle.borderClass
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0",
                                        selectedBadgeStyle.class
                                    )}
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    <span>{label || "BREAKING"}</span>
                                </div>

                                <div className="flex-1 overflow-hidden relative">
                                    <div
                                        className="animate-ticker inline-flex items-center gap-4"
                                        style={{ "--ticker-duration": `${Math.max(12, speed)}s` }}
                                    >
                                        {(activeItems.length > 0 ? activeItems : [{ text: "Add custom announcements below to display them here..." }]).map((item, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-2">
                                                {item.badge && (
                                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-white/20 text-white">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <span className="whitespace-nowrap font-medium">{item.text}</span>
                                                <span className="opacity-40 text-[10px]">◆</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground bg-muted/20">
                            Marquee is currently disabled. Toggle &quot;Enable Marquee Banner&quot; below to activate.
                        </div>
                    )}
                </div>
            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Settings Controls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Master Switches & Branding */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div>
                                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-primary" />
                                    Display & Presentation Settings
                                </h2>
                                <p className="text-xs text-muted-foreground">Manage visibility, title badge, and theme styling.</p>
                            </div>

                            {/* Active Master Toggle */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => setIsEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Label Badge Text */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">
                                    Ticker Badge Text
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="e.g. BREAKING NEWS, MARKET ALERT"
                                    className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            {/* Badge Color Palette */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">
                                    Badge Accent Color
                                </label>
                                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                    {BADGE_COLORS.map((b) => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => setLabelBg(b.id)}
                                            className={cn(
                                                "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                                b.id === labelBg
                                                    ? `${b.class} ring-2 ring-offset-2 ring-primary border-transparent`
                                                    : "bg-muted text-muted-foreground border-border hover:bg-accent"
                                            )}
                                        >
                                            {b.label.split(" ")[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Theme Selectors */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                                <Palette className="w-3.5 h-3.5 text-primary" />
                                Banner Color Theme
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {THEME_OPTIONS.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        className={cn(
                                            "p-3 rounded-xl border text-left transition-all",
                                            theme === t.id
                                                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                                                : "border-border hover:border-primary/40 bg-card"
                                        )}
                                    >
                                        <div className={cn("w-full h-5 rounded-md mb-2 border", t.bgClass, t.borderClass)} />
                                        <div className="text-xs font-bold text-foreground">{t.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Speed & Autoscroll Behavior */}
                        <div className="pt-2 border-t border-border space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Gauge className="w-3.5 h-3.5 text-primary" />
                                        Scroll Cycle Duration
                                    </label>
                                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                                        {speed} seconds {speed <= 20 ? "(Fast)" : speed <= 40 ? "(Normal)" : "(Slow)"}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="15"
                                    max="70"
                                    step="5"
                                    value={speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                    <span>15s (Faster)</span>
                                    <span>35s (Recommended)</span>
                                    <span>70s (Very Slow)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={pauseOnHover}
                                        onChange={(e) => setPauseOnHover(e.target.checked)}
                                        className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                                    />
                                    <div>
                                        <span className="text-xs font-bold block text-foreground">Pause on Hover</span>
                                        <span className="text-[11px] text-muted-foreground">Stops ticker when user points cursor</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeLatestPosts}
                                        onChange={(e) => setIncludeLatestPosts(e.target.checked)}
                                        className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                                    />
                                    <div>
                                        <span className="text-xs font-bold block text-foreground">Include Latest Articles</span>
                                        <span className="text-[11px] text-muted-foreground">Auto-append 5 recent published articles</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Announcement Items Management */}
                    <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div>
                                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary" />
                                    Custom Ticker Announcements ({items.length})
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Add, reorder, or edit announcements that cycle across the ticker.
                                </p>
                            </div>
                        </div>

                        {/* Add New Item Form */}
                        <form onSubmit={handleAddItem} className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5 text-primary" />
                                Add New Announcement Item
                            </span>

                            <div className="space-y-2.5">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Announcement text (e.g. Chemical Industry Summit 2026 early registration now open)..."
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Clickable link (optional, e.g. /posts/news-roundup)"
                                        value={newItemLink}
                                        onChange={(e) => setNewItemLink(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Tag / Badge (optional, e.g. ALERT, NEW)"
                                            value={newItemBadge}
                                            onChange={(e) => setNewItemBadge(e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none uppercase"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Items List */}
                        <div className="space-y-2.5">
                            {items.length === 0 ? (
                                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                                    No custom announcements added yet. Add one above!
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div
                                        key={item._id || idx}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all space-y-2",
                                            item.isActive ? "bg-card border-border shadow-xs" : "bg-muted/20 border-border/60 opacity-60"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleItemActive(idx)}
                                                    className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-colors",
                                                        item.isActive
                                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                            : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                                                    )}
                                                >
                                                    {item.isActive ? "Active" : "Paused"}
                                                </button>

                                                {item.badge && (
                                                    <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary shrink-0">
                                                        {item.badge}
                                                    </span>
                                                )}

                                                <span className="text-xs font-semibold text-foreground truncate">
                                                    {item.text}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveItem(idx, -1)}
                                                    disabled={idx === 0}
                                                    className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveItem(idx, 1)}
                                                    disabled={idx === items.length - 1}
                                                    className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteItem(idx)}
                                                    className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline Edit Inputs */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-border/50 text-xs">
                                            <div className="sm:col-span-6">
                                                <input
                                                    type="text"
                                                    value={item.text}
                                                    onChange={(e) => handleUpdateItemField(idx, "text", e.target.value)}
                                                    className="w-full px-2.5 py-1 text-xs rounded border border-input bg-background"
                                                    placeholder="Announcement text"
                                                />
                                            </div>
                                            <div className="sm:col-span-4">
                                                <input
                                                    type="text"
                                                    value={item.link || ""}
                                                    onChange={(e) => handleUpdateItemField(idx, "link", e.target.value)}
                                                    className="w-full px-2.5 py-1 text-xs rounded border border-input bg-background"
                                                    placeholder="URL / link"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <input
                                                    type="text"
                                                    value={item.badge || ""}
                                                    onChange={(e) => handleUpdateItemField(idx, "badge", e.target.value.toUpperCase())}
                                                    className="w-full px-2.5 py-1 text-xs rounded border border-input bg-background uppercase font-bold"
                                                    placeholder="Badge"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Tips & Info */}
                <div className="space-y-6">
                    <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            How the Top Marquee Works
                        </h3>
                        <ul className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>
                                    <strong>Placement:</strong> Sits fixed directly above the main website navigation bar, ensuring breaking news catches reader attention immediately.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>
                                    <strong>Buttery Smooth:</strong> Uses GPU-accelerated CSS keyframe animations for 60fps infinite scrolling with zero hitching.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>
                                    <strong>Automatic Articles:</strong> When enabled, the 5 latest published chemical and industrial articles will automatically rotate alongside custom ticker messages.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>
                                    <strong>Interactive:</strong> Readers can pause scrolling by hovering their mouse and click directly on announcements to view full reports.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Pro Editorial Tip
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Keep announcement messages concise (between 8 to 20 words). Short, punchy headlines are easier for fast readers to digest as the banner scrolls.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save All Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
