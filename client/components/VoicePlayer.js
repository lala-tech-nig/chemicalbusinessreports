"use client";

import { useState, useMemo } from "react";
import {
    Play,
    Pause,
    RotateCcw,
    Settings2,
    Sparkles,
    Headphones,
    SkipForward,
    SkipBack,
    Radio
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function VoicePlayer({ title, excerpt, content, slug, category, className = "" }) {
    const {
        isSupported,
        currentTrack,
        playTrack,
        togglePlayPause,
        isPlaying: isGlobalPlaying,
        isPaused: isGlobalPaused,
        currentChunkIndex: globalChunkIndex,
        paragraphs: globalParagraphs,
        progressPercent: globalProgress,
        rate,
        setRate,
        pitch,
        setPitch,
        voices,
        selectedVoiceURI,
        setVoice,
        activeVoice,
        nextParagraph,
        prevParagraph,
        stopTrack
    } = useAudio();

    const [showSettings, setShowSettings] = useState(false);

    const isThisTrackPlaying = currentTrack && currentTrack.title === title;
    const isPlaying = isThisTrackPlaying && isGlobalPlaying;
    const isPaused = isThisTrackPlaying && isGlobalPaused;

    // Local fallback word count estimation
    const estimatedMinutes = useMemo(() => {
        let text = (title || "") + " " + (excerpt || "");
        if (content) {
            text += " " + content.replace(/<[^>]+>/g, " ");
        }
        const words = text.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 150));
    }, [title, excerpt, content]);

    const activeParagraphsCount = isThisTrackPlaying ? globalParagraphs.length : 1;
    const activeChunkIndex = isThisTrackPlaying ? globalChunkIndex : 0;
    const activeProgress = isThisTrackPlaying ? globalProgress : 0;

    const handlePlayClick = () => {
        if (isThisTrackPlaying) {
            togglePlayPause();
        } else {
            playTrack({ title, excerpt, content, slug, category });
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <div
            className={`relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-primary/[0.02] to-amber-500/[0.05] p-6 md:p-8 shadow-sm transition-all hover:shadow-md ${className}`}
        >
            {/* Decorative background blur shape */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* Left: Badge & Info */}
                <div className="flex items-start gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
                            {isPlaying && !isPaused ? (
                                <Radio className="w-6 h-6 animate-pulse" />
                            ) : (
                                <Headphones className="w-6 h-6" />
                            )}
                        </div>
                        {isPlaying && !isPaused && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                                Voice Narration
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                                ~{estimatedMinutes} min listen
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 leading-snug">
                            Listen to Article
                        </h4>
                        <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">
                            {activeVoice ? activeVoice.name : "Storyteller Female Voice"}
                        </p>
                    </div>
                </div>

                {/* Right: Primary Controls */}
                <div className="flex items-center gap-3">
                    {isThisTrackPlaying && (
                        <button
                            onClick={prevParagraph}
                            title="Previous paragraph"
                            className="p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-white/80 transition-all border border-gray-200/60 shadow-xs"
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={handlePlayClick}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/95 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        {isPlaying && !isPaused ? (
                            <>
                                <Pause className="w-5 h-5 fill-current" />
                                <span>Pause</span>
                            </>
                        ) : isPaused ? (
                            <>
                                <Play className="w-5 h-5 fill-current" />
                                <span>Resume</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-current" />
                                <span>Play Article</span>
                            </>
                        )}
                    </button>

                    {isThisTrackPlaying && (
                        <button
                            onClick={nextParagraph}
                            title="Next paragraph"
                            className="p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-white/80 transition-all border border-gray-200/60 shadow-xs"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>
                    )}

                    {isThisTrackPlaying && (
                        <button
                            onClick={() => playTrack({ title, excerpt, content, slug, category })}
                            title="Restart Audio"
                            className="p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-white/80 transition-all border border-gray-200/60 shadow-xs"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        title="Audio Voice Settings"
                        className={`p-2.5 rounded-xl transition-all border shadow-xs ${
                            showSettings
                                ? "bg-primary text-primary-foreground border-primary"
                                : "text-gray-600 hover:text-primary hover:bg-white/80 border-gray-200/60"
                        }`}
                    >
                        <Settings2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ANIMATED EQUALIZER & PROGRESS BAR */}
            {isThisTrackPlaying && (
                <div className="mt-5 pt-4 border-t border-gray-200/60 relative z-10">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
                        <div className="flex items-center gap-2">
                            {isPlaying && !isPaused && (
                                <div className="flex items-end gap-0.5 h-3">
                                    <span className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
                                    <span className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_300ms] h-2/3" />
                                    <span className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_200ms] h-4/5" />
                                    <span className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_400ms] h-1/2" />
                                </div>
                            )}
                            <span className="text-gray-700 font-bold">
                                Paragraph {activeChunkIndex + 1} of {activeParagraphsCount}
                            </span>
                        </div>
                        <span>{activeProgress}% completed</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden relative cursor-pointer group">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-300 relative"
                            style={{ width: `${activeProgress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                        </div>
                    </div>
                </div>
            )}

            {/* EXPANDABLE SETTINGS DRAWER */}
            {showSettings && (
                <div className="mt-6 pt-6 border-t border-gray-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/70 p-5 rounded-2xl backdrop-blur-xs relative z-10">
                    {/* Voice Selector */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-600 mb-2">
                            Narrator Voice
                        </label>
                        <select
                            value={selectedVoiceURI}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium bg-white rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
                        >
                            {voices.map((v) => (
                                <option key={v.voiceURI} value={v.voiceURI}>
                                    {v.name} ({v.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Speed Selector */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-600 mb-2">
                            Playback Speed ({rate}x)
                        </label>
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
                            {[0.75, 0.98, 1.1, 1.25, 1.5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setRate(s)}
                                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                                        rate === s
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {s === 0.98 ? "1.0x" : `${s}x`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Storytelling Pitch Selector */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-600 mb-2">
                            Voice Pitch ({pitch === 1.1 ? "Storyteller" : `${pitch}x`})
                        </label>
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
                            {[
                                { label: "Deep", val: 0.9 },
                                { label: "Normal", val: 1.0 },
                                { label: "Storyteller", val: 1.1 },
                                { label: "Warm", val: 1.2 }
                            ].map((p) => (
                                <button
                                    key={p.val}
                                    onClick={() => setPitch(p.val)}
                                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                        pitch === p.val
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
