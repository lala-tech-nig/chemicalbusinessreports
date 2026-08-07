"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    Settings2,
    Sparkles,
    Headphones,
    SkipForward,
    SkipBack,
    X,
    Radio
} from "lucide-react";

/**
 * Strips HTML tags and returns clean text sentences/paragraphs for SpeechSynthesis.
 */
function extractParagraphs(title, excerpt, htmlContent) {
    const items = [];

    if (title && title.trim()) {
        items.push(title.trim() + ".");
    }

    if (excerpt && excerpt.trim()) {
        // Remove quotes if present
        const cleanExcerpt = excerpt.replace(/^["'\s]+|["'\s]+$/g, "");
        items.push(cleanExcerpt + ".");
    }

    if (htmlContent) {
        // Parse HTML using DOMParser if available in browser
        let plainText = htmlContent;
        if (typeof window !== "undefined" && window.DOMParser) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");
            
            // Extract paragraph blocks or main body text
            const pElements = doc.querySelectorAll("p, h1, h2, h3, h4, li");
            if (pElements.length > 0) {
                pElements.forEach((el) => {
                    const text = el.textContent?.trim();
                    if (text && text.length > 3) {
                        items.push(text);
                    }
                });
            } else {
                plainText = doc.body.textContent || "";
            }
        }

        if (items.length === (title ? 1 : 0) + (excerpt ? 1 : 0) && plainText) {
            // Fallback split by double line breaks or sentences
            const fallbackParagraphs = plainText
                .replace(/<[^>]+>/g, " ")
                .split(/(?:\r?\n){2,}|\.\s+/)
                .map((p) => p.trim())
                .filter((p) => p.length > 5);

            items.push(...fallbackParagraphs);
        }
    }

    return items.length > 0 ? items : ["No audio content available."];
}

/**
 * Finds the best female storytelling voice available on the system.
 */
function findBestFemaleVoice(voices) {
    if (!voices || voices.length === 0) return null;

    const femaleKeywords = [
        "female",
        "zira",
        "aria",
        "jenny",
        "samantha",
        "victoria",
        "karen",
        "fiona",
        "moira",
        "serena",
        "natasha",
        "google uk english female",
        "google us english female",
        "google natural",
        "neural",
        "en-us",
        "en-gb"
    ];

    // Priority 1: High quality English female / neural voices
    for (const kw of femaleKeywords) {
        const found = voices.find(
            (v) =>
                v.lang.startsWith("en") &&
                v.name.toLowerCase().includes(kw.toLowerCase())
        );
        if (found) return found;
    }

    // Priority 2: Any English voice with "female" or "woman" in name
    const anyFemale = voices.find(
        (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("woman") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("aria")
    );
    if (anyFemale) return anyFemale;

    // Priority 3: First available English voice
    const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
    if (anyEnglish) return anyEnglish;

    return voices[0];
}

export default function VoicePlayer({ title, excerpt, content, className = "" }) {
    const [isSupported, setIsSupported] = useState(true);
    const [voices, setVoices] = useState([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [rate, setRate] = useState(0.98); // Storytelling speed
    const [pitch, setPitch] = useState(1.1); // Warm storytelling pitch
    const [showSettings, setShowSettings] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isStickyVisible, setIsStickyVisible] = useState(false);

    const playerContainerRef = useRef(null);
    const utteranceRef = useRef(null);
    const activeIndexRef = useRef(0);
    const isPlayingRef = useRef(false);

    // Extract readable text chunks
    const paragraphs = useMemo(
        () => extractParagraphs(title, excerpt, content),
        [title, excerpt, content]
    );

    // Calculate total words and estimated time
    const totalWords = useMemo(() => {
        return paragraphs.reduce(
            (acc, p) => acc + (p ? p.split(/\s+/).length : 0),
            0
        );
    }, [paragraphs]);

    const estimatedMinutes = Math.max(1, Math.ceil(totalWords / 150));

    // Calculate progress percentage
    const progressPercent = useMemo(() => {
        if (paragraphs.length <= 1) return isPlaying ? 100 : 0;
        return Math.min(100, Math.round((currentChunkIndex / paragraphs.length) * 100));
    }, [currentChunkIndex, paragraphs.length, isPlaying]);

    // Keep active index ref synced for callbacks
    useEffect(() => {
        activeIndexRef.current = currentChunkIndex;
    }, [currentChunkIndex]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Check Web Speech API support & load voices
    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            setIsSupported(false);
            return;
        }

        const updateVoices = () => {
            const availVoices = window.speechSynthesis.getVoices();
            if (availVoices.length > 0) {
                setVoices(availVoices);

                // Check localStorage for saved voice or pick best female voice
                const savedVoice = localStorage.getItem("cbr_narrator_voice");
                const defaultFemale = findBestFemaleVoice(availVoices);

                if (savedVoice && availVoices.some((v) => v.voiceURI === savedVoice)) {
                    setSelectedVoiceURI(savedVoice);
                } else if (defaultFemale) {
                    setSelectedVoiceURI(defaultFemale.voiceURI);
                }

                // Check saved pitch & rate
                const savedPitch = localStorage.getItem("cbr_narrator_pitch");
                const savedRate = localStorage.getItem("cbr_narrator_rate");
                if (savedPitch) setPitch(parseFloat(savedPitch));
                if (savedRate) setRate(parseFloat(savedRate));
            }
        };

        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // IntersectionObserver for Sticky Player when scrolling
    useEffect(() => {
        if (!playerContainerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show sticky bar when main player leaves viewport AND audio is active or paused
                setIsStickyVisible(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(playerContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // Speak a specific paragraph chunk
    const speakChunk = (index) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        if (index >= paragraphs.length) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentChunkIndex(0);
            return;
        }

        const textToSpeak = paragraphs[index];
        if (!textToSpeak || !textToSpeak.trim()) {
            speakChunk(index + 1);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utteranceRef.current = utterance;

        // Apply voice
        const currentVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
        if (currentVoice) {
            utterance.voice = currentVoice;
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = isMuted ? 0 : 1;

        utterance.onend = () => {
            if (isPlayingRef.current) {
                const nextIdx = activeIndexRef.current + 1;
                if (nextIdx < paragraphs.length) {
                    setCurrentChunkIndex(nextIdx);
                    speakChunk(nextIdx);
                } else {
                    setIsPlaying(false);
                    setIsPaused(false);
                    setCurrentChunkIndex(0);
                }
            }
        };

        utterance.onerror = (event) => {
            console.error("SpeechSynthesis error:", event);
            if (isPlayingRef.current) {
                const nextIdx = activeIndexRef.current + 1;
                if (nextIdx < paragraphs.length) {
                    setCurrentChunkIndex(nextIdx);
                    speakChunk(nextIdx);
                } else {
                    setIsPlaying(false);
                    setIsPaused(false);
                }
            }
        };

        setCurrentChunkIndex(index);
        setIsPlaying(true);
        setIsPaused(false);
        window.speechSynthesis.speak(utterance);
    };

    const handlePlayPause = () => {
        if (!isSupported) return;

        if (isPlaying) {
            if (isPaused) {
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
        } else {
            speakChunk(currentChunkIndex);
        }
    };

    const handleStop = () => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChunkIndex(0);
    };

    const handleReplay = () => {
        speakChunk(0);
    };

    const handleNext = () => {
        const nextIdx = Math.min(paragraphs.length - 1, currentChunkIndex + 1);
        speakChunk(nextIdx);
    };

    const handlePrev = () => {
        const prevIdx = Math.max(0, currentChunkIndex - 1);
        speakChunk(prevIdx);
    };

    const handleVoiceChange = (e) => {
        const uri = e.target.value;
        setSelectedVoiceURI(uri);
        localStorage.setItem("cbr_narrator_voice", uri);
        if (isPlaying) {
            speakChunk(currentChunkIndex);
        }
    };

    const handleRateChange = (newRate) => {
        setRate(newRate);
        localStorage.setItem("cbr_narrator_rate", newRate.toString());
        if (isPlaying) {
            speakChunk(currentChunkIndex);
        }
    };

    const handlePitchChange = (newPitch) => {
        setPitch(newPitch);
        localStorage.setItem("cbr_narrator_pitch", newPitch.toString());
        if (isPlaying) {
            speakChunk(currentChunkIndex);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (isPlaying && utteranceRef.current) {
            utteranceRef.current.volume = isMuted ? 1 : 0;
        }
    };

    const activeVoice = useMemo(
        () => voices.find((v) => v.voiceURI === selectedVoiceURI),
        [voices, selectedVoiceURI]
    );

    if (!isSupported) {
        return null;
    }

    return (
        <>
            {/* MAIN HEADER AUDIO PLAYER CARD */}
            <div
                ref={playerContainerRef}
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
                        {isPlaying && (
                            <button
                                onClick={handlePrev}
                                title="Previous paragraph"
                                className="p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-white/80 transition-all border border-gray-200/60 shadow-xs"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={handlePlayPause}
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

                        {isPlaying && (
                            <button
                                onClick={handleNext}
                                title="Next paragraph"
                                className="p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-white/80 transition-all border border-gray-200/60 shadow-xs"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>
                        )}

                        {isPlaying && (
                            <button
                                onClick={handleReplay}
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
                {(isPlaying || isPaused || progressPercent > 0) && (
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
                                    Paragraph {currentChunkIndex + 1} of {paragraphs.length}
                                </span>
                            </div>
                            <span>{progressPercent}% completed</span>
                        </div>

                        {/* Interactive Progress Bar */}
                        <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden relative cursor-pointer group">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-300 relative"
                                style={{ width: `${progressPercent}%` }}
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
                                onChange={handleVoiceChange}
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
                                        onClick={() => handleRateChange(s)}
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
                                        onClick={() => handlePitchChange(p.val)}
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

            {/* STICKY FLOATING BOTTOM MINI-PLAYER (Appears on scroll when playing) */}
            {isStickyVisible && (isPlaying || isPaused) && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-white/10 transition-all duration-300 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Indicator & Title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                                <Headphones className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-extrabold text-primary uppercase tracking-wider">
                                    Now Reading
                                </p>
                                <p className="text-xs text-gray-200 font-medium truncate">
                                    {title}
                                </p>
                            </div>
                        </div>

                        {/* Center: Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handlePrev}
                                className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handlePlayPause}
                                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                            >
                                {isPlaying && !isPaused ? (
                                    <Pause className="w-5 h-5 fill-current" />
                                ) : (
                                    <Play className="w-5 h-5 fill-current" />
                                )}
                            </button>

                            <button
                                onClick={handleNext}
                                className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right: Close / Stop */}
                        <button
                            onClick={handleStop}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                            title="Stop Audio"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Bottom Progress Bar */}
                    <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-3">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
