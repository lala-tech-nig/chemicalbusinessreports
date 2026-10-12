"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchMarqueeSettings } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Flame, ArrowUpRight, Megaphone, Bell, Sparkles } from "lucide-react";

const THEME_STYLES = {
    blue: {
        // Exact blue-400 shade from "Concepts (Ltd)" on Hero section
        container: "bg-blue-400 text-slate-950 border-b border-blue-500/60 shadow-xs",
        divider: "text-blue-900/60 font-black",
        fadeFrom: "from-blue-400",
        itemText: "text-slate-950 hover:text-blue-950 font-bold sm:font-extrabold",
        badgeDefault: "bg-slate-950 text-white border border-slate-900/70 shadow-xs",
    },
    dark: {
        container: "bg-slate-950 text-slate-100 border-slate-800/80",
        divider: "text-slate-600 font-bold",
        fadeFrom: "from-slate-950",
        itemText: "text-slate-100 hover:text-white font-bold sm:font-extrabold",
        badgeDefault: "bg-slate-800 text-slate-200 border border-slate-700/60",
    },
    slate: {
        container: "bg-zinc-900 text-zinc-100 border-zinc-800",
        divider: "text-zinc-600 font-bold",
        fadeFrom: "from-zinc-900",
        itemText: "text-zinc-100 hover:text-white font-bold sm:font-extrabold",
        badgeDefault: "bg-zinc-800 text-zinc-300 border border-zinc-700/60",
    },
    light: {
        container: "bg-slate-100 text-slate-900 border-slate-200/90 shadow-inner",
        divider: "text-slate-400 font-bold",
        fadeFrom: "from-slate-100",
        itemText: "text-slate-950 hover:text-blue-700 font-bold sm:font-extrabold",
        badgeDefault: "bg-white text-slate-900 border border-slate-300 shadow-xs",
    },
};

const BADGE_COLORS = {
    dark: "bg-slate-950 text-white shadow-xs ring-1 ring-white/10",
    blue: "bg-blue-950 text-white shadow-xs ring-1 ring-white/10",
    red: "bg-red-600 text-white shadow-xs",
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

    const theme = THEME_STYLES[config.theme] || THEME_STYLES.blue;
    const durationSec = Math.max(12, Number(config.speed) || 35);

    const renderItem = (item, index, keyPrefix) => {
        const key = `${keyPrefix}-${item._id || index}`;
        const content = (
            <span className="inline-flex items-center gap-2.5 px-3.5 group/item">
                {item.badge && (
                    <span
                        className={cn(
                            "px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black tracking-wider uppercase shrink-0 transition-transform group-hover/item:scale-105",
                            theme.badgeDefault
                        )}
                    >
                        {item.badge}
                    </span>
                )}
                <span className={cn("text-xs sm:text-[13px] tracking-normal transition-colors whitespace-nowrap", theme.itemText)}>
                    {item.text}
                </span>
                {item.link && (
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] opacity-70 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all shrink-0" />
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
                <span className={cn("mx-3 select-none text-xs sm:text-sm font-black", theme.divider)}>
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
            <div className="max-w-[1500px] mx-auto flex items-stretch h-10 sm:h-11">
                {/* Simple Red Dot Indicator to signal importance (no text badge) */}
                <div className="relative z-20 flex items-center shrink-0 pl-3.5 sm:pl-4 pr-2 bg-inherit">
                    <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3" title="Important updates">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-80"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-600 ring-2 ring-red-400/40 shadow-xs"></span>
                    </span>

                    {/* Gradient separator mask to soften transition */}
                    <div
                        className={cn(
                            "w-3 h-full pointer-events-none bg-gradient-to-r to-transparent ml-2",
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
