"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchMarqueeSettings } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Flame, ArrowUpRight, Megaphone, Bell, Sparkles } from "lucide-react";

const THEME_STYLES = {
    dark: {
        container: "bg-slate-950 text-slate-100 border-slate-800/80",
        divider: "text-slate-600",
        fadeFrom: "from-slate-950",
        itemText: "text-slate-200 hover:text-white",
        badgeDefault: "bg-slate-800 text-slate-300 border border-slate-700/60",
    },
    blue: {
        container: "bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-blue-50 border-blue-900/60",
        divider: "text-blue-500/40",
        fadeFrom: "from-blue-950",
        itemText: "text-blue-100 hover:text-white",
        badgeDefault: "bg-blue-900/80 text-blue-200 border border-blue-700/60",
    },
    slate: {
        container: "bg-zinc-900 text-zinc-100 border-zinc-800",
        divider: "text-zinc-600",
        fadeFrom: "from-zinc-900",
        itemText: "text-zinc-200 hover:text-white",
        badgeDefault: "bg-zinc-800 text-zinc-300 border border-zinc-700/60",
    },
    light: {
        container: "bg-slate-100 text-slate-900 border-slate-200/90 shadow-inner",
        divider: "text-slate-300",
        fadeFrom: "from-slate-100",
        itemText: "text-slate-700 hover:text-blue-700 font-medium",
        badgeDefault: "bg-white text-slate-700 border border-slate-200 shadow-xs",
    },
};

const BADGE_COLORS = {
    red: "bg-red-600 text-white shadow-xs",
    blue: "bg-blue-600 text-white shadow-xs",
    amber: "bg-amber-500 text-slate-950 font-bold shadow-xs",
    emerald: "bg-emerald-600 text-white shadow-xs",
    purple: "bg-purple-600 text-white shadow-xs",
};

export default function TopMarquee({ onVisibilityChange }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function loadSettings() {
            try {
                const data = await fetchMarqueeSettings();
                if (isMounted && data) {
                    setConfig(data);
                    if (onVisibilityChange) {
                        onVisibilityChange(Boolean(data.isEnabled));
                    }
                }
            } catch (err) {
                console.error("TopMarquee load error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadSettings();
        return () => {
            isMounted = false;
        };
    }, [onVisibilityChange]);

    if (loading || !config || !config.isEnabled) {
        return null;
    }

    // Combine active custom items with latest posts if enabled
    const customItems = (config.items || []).filter(item => item.isActive !== false);
    const latestItems = config.includeLatestPosts && config.latestPosts ? config.latestPosts : [];
    const allItems = [...customItems, ...latestItems];

    if (allItems.length === 0) {
        return null;
    }

    const theme = THEME_STYLES[config.theme] || THEME_STYLES.dark;
    const badgeColor = BADGE_COLORS[config.labelBg] || BADGE_COLORS.red;
    const durationSec = Math.max(12, Number(config.speed) || 35);

    const renderItem = (item, index, keyPrefix) => {
        const key = `${keyPrefix}-${item._id || index}`;
        const content = (
            <span className="inline-flex items-center gap-2 px-3 group/item">
                {item.badge && (
                    <span
                        className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 transition-transform group-hover/item:scale-105",
                            theme.badgeDefault
                        )}
                    >
                        {item.badge}
                    </span>
                )}
                <span className={cn("text-xs tracking-wide transition-colors whitespace-nowrap", theme.itemText)}>
                    {item.text}
                </span>
                {item.link && (
                    <ArrowUpRight className="w-3 h-3 opacity-60 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                )}
            </span>
        );

        return (
            <div key={key} className="inline-flex items-center">
                {item.link ? (
                    <Link
                        href={item.link}
                        className="inline-flex items-center focus:outline-none"
                    >
                        {content}
                    </Link>
                ) : (
                    content
                )}
                <span className={cn("mx-2 select-none text-[11px] font-bold", theme.divider)}>
                    ◆
                </span>
            </div>
        );
    };

    return (
        <div
            id="top-marquee-banner"
            className={cn(
                "relative w-full border-b text-xs overflow-hidden select-none z-50 ticker-container transition-all duration-300",
                theme.container
            )}
            style={{
                "--ticker-duration": `${durationSec}s`,
            }}
        >
            <div className="max-w-[1500px] mx-auto flex items-stretch h-8 sm:h-8.5">
                {/* Left Pinned Badge */}
                <div className="relative z-20 flex items-center shrink-0 pl-2 sm:pl-3 pr-2 bg-inherit">
                    <div
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider",
                            badgeColor
                        )}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span className="truncate max-w-[130px] sm:max-w-none">
                            {config.label || "BREAKING"}
                        </span>
                    </div>

                    {/* Gradient separator mask to soften badge transition */}
                    <div
                        className={cn(
                            "w-4 h-full pointer-events-none bg-gradient-to-r to-transparent",
                            theme.fadeFrom
                        )}
                    />
                </div>

                {/* Autoscrolling Track Container */}
                <div className="relative flex-1 overflow-hidden flex items-center">
                    {/* Left edge shadow fade */}
                    <div
                        className={cn(
                            "absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r to-transparent",
                            theme.fadeFrom
                        )}
                    />

                    {/* Infinite Scrolling Ticker Track */}
                    <div
                        className={cn(
                            "animate-ticker inline-flex items-center py-1",
                            config.pauseOnHover && "pause-on-hover"
                        )}
                    >
                        {/* Track 1: Original items */}
                        <div className="inline-flex items-center">
                            {allItems.map((item, idx) => renderItem(item, idx, "track1"))}
                        </div>

                        {/* Track 2: Duplicate items for seamless continuous looping */}
                        <div className="inline-flex items-center" aria-hidden="true">
                            {allItems.map((item, idx) => renderItem(item, idx, "track2"))}
                        </div>
                    </div>

                    {/* Right edge shadow fade */}
                    <div
                        className={cn(
                            "absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-gradient-to-l to-transparent",
                            theme.fadeFrom
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
