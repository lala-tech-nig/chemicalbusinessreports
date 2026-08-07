"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Play,
    Pause,
    Headphones,
    SkipForward,
    SkipBack,
    X,
    RotateCcw,
    Sparkles,
    ChevronUp,
    ChevronDown,
    Radio,
    Settings2
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function GlobalAudioPlayer() {
    const {
        currentTrack,
        isPlaying,
        isPaused,
        togglePlayPause,
        stopTrack,
        nextParagraph,
        prevParagraph,
        progressPercent,
        currentChunkIndex,
        paragraphs,
        rate,
        setRate,
        pitch,
        setPitch,
        voices,
        selectedVoiceURI,
        setVoice,
        activeVoice
    } = useAudio();

    const [isExpanded, setIsExpanded] = useState(false);
    const pathname = usePathname();

    if (!currentTrack) return null;

    const isCurrentPostPage = currentTrack.slug && pathname === `/posts/${currentTrack.slug}`;

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl bg-gray-900/95 text-white p-4 rounded-3xl shadow-2xl border border-white/15 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5">
            {/* TOP BAR */}
            <div className="flex items-center justify-between gap-3">
                {/* Left: Icon & Track Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
                            {isPlaying && !isPaused ? (
                                <Radio className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Headphones className="w-5 h-5" />
                            )}
                        </div>
                        {isPlaying && !isPaused && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                Voice Narration
                            </span>
                            {!isCurrentPostPage && currentTrack.slug && (
                                <Link
                                    href={`/posts/${currentTrack.slug}`}
                                    className="text-[10px] text-gray-400 hover:text-primary underline truncate"
                                >
                                    Return to post →
                                </Link>
                            )}
                        </div>

                        {currentTrack.slug && !isCurrentPostPage ? (
                            <Link href={`/posts/${currentTrack.slug}`}>
                                <h5 className="text-xs font-bold text-gray-100 truncate hover:text-primary transition-colors">
                                    {currentTrack.title}
                                </h5>
                            </Link>
                        ) : (
                            <h5 className="text-xs font-bold text-gray-100 truncate">
                                {currentTrack.title}
                            </h5>
                        )}

                        <p className="text-[10px] text-gray-400 font-medium truncate">
                            Paragraph {currentChunkIndex + 1} of {paragraphs.length} • {activeVoice ? activeVoice.name : "Female Voice"}
                        </p>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={prevParagraph}
                        className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all hidden sm:flex"
                        title="Previous paragraph"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                        onClick={togglePlayPause}
                        className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30"
                        title={isPlaying && !isPaused ? "Pause" : "Play"}
                    >
                        {isPlaying && !isPaused ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={nextParagraph}
                        className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all hidden sm:flex"
                        title="Next paragraph"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                        title="Voice settings"
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={stopTrack}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/10 transition-all"
                        title="Close player"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* EXPANDABLE QUICK CONTROLS */}
            {isExpanded && (
                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                            Narrator Voice
                        </label>
                        <select
                            value={selectedVoiceURI}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-medium bg-gray-800 rounded-xl border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {voices.map((v) => (
                                <option key={v.voiceURI} value={v.voiceURI}>
                                    {v.name} ({v.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                            Playback Speed ({rate}x)
                        </label>
                        <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
                            {[0.75, 0.98, 1.1, 1.25, 1.5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setRate(s)}
                                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                        rate === s
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    {s === 0.98 ? "1.0x" : `${s}x`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* PROGRESS BAR */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
