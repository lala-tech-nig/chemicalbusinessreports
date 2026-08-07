"use client";

import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";

const AudioContext = createContext(null);

function extractParagraphs(title, excerpt, htmlContent) {
    const items = [];

    if (title && title.trim()) {
        items.push(title.trim() + ".");
    }

    if (excerpt && excerpt.trim()) {
        const cleanExcerpt = excerpt.replace(/^["'\s]+|["'\s]+$/g, "");
        items.push(cleanExcerpt + ".");
    }

    if (htmlContent) {
        let plainText = htmlContent;
        if (typeof window !== "undefined" && window.DOMParser) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");
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

    for (const kw of femaleKeywords) {
        const found = voices.find(
            (v) =>
                v.lang.startsWith("en") &&
                v.name.toLowerCase().includes(kw.toLowerCase())
        );
        if (found) return found;
    }

    const anyFemale = voices.find(
        (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("woman") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("aria")
    );
    if (anyFemale) return anyFemale;

    const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
    if (anyEnglish) return anyEnglish;

    return voices[0];
}

export function AudioProvider({ children }) {
    const [isSupported, setIsSupported] = useState(true);
    const [voices, setVoices] = useState([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
    const [currentTrack, setCurrentTrack] = useState(null); // { id, title, excerpt, content, slug, category }
    const [paragraphs, setParagraphs] = useState([]);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRateState] = useState(0.98);
    const [pitch, setPitchState] = useState(1.1);
    const [isMuted, setIsMuted] = useState(false);

    const utteranceRef = useRef(null);
    const activeIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const paragraphsRef = useRef([]);

    useEffect(() => {
        activeIndexRef.current = currentChunkIndex;
    }, [currentChunkIndex]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        paragraphsRef.current = paragraphs;
    }, [paragraphs]);

    // Speech Synthesis initialization
    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            setIsSupported(false);
            return;
        }

        const updateVoices = () => {
            const availVoices = window.speechSynthesis.getVoices();
            if (availVoices.length > 0) {
                setVoices(availVoices);

                const savedVoice = localStorage.getItem("cbr_narrator_voice");
                const defaultFemale = findBestFemaleVoice(availVoices);

                if (savedVoice && availVoices.some((v) => v.voiceURI === savedVoice)) {
                    setSelectedVoiceURI(savedVoice);
                } else if (defaultFemale) {
                    setSelectedVoiceURI(defaultFemale.voiceURI);
                }

                const savedPitch = localStorage.getItem("cbr_narrator_pitch");
                const savedRate = localStorage.getItem("cbr_narrator_rate");
                if (savedPitch) setPitchState(parseFloat(savedPitch));
                if (savedRate) setRateState(parseFloat(savedRate));
            }
        };

        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, []);

    const speakChunk = (index, trackParagraphs = paragraphsRef.current) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        if (!trackParagraphs || index >= trackParagraphs.length) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentChunkIndex(0);
            return;
        }

        const textToSpeak = trackParagraphs[index];
        if (!textToSpeak || !textToSpeak.trim()) {
            speakChunk(index + 1, trackParagraphs);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utteranceRef.current = utterance;

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
                const currentPars = paragraphsRef.current;
                if (nextIdx < currentPars.length) {
                    setCurrentChunkIndex(nextIdx);
                    speakChunk(nextIdx, currentPars);
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
                const currentPars = paragraphsRef.current;
                if (nextIdx < currentPars.length) {
                    setCurrentChunkIndex(nextIdx);
                    speakChunk(nextIdx, currentPars);
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

    const playTrack = (track) => {
        const parsed = extractParagraphs(track.title, track.excerpt, track.content);
        setCurrentTrack(track);
        setParagraphs(parsed);
        setCurrentChunkIndex(0);
        speakChunk(0, parsed);
    };

    const togglePlayPause = () => {
        if (!isSupported || !currentTrack) return;

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

    const stopTrack = () => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTrack(null);
        setParagraphs([]);
        setCurrentChunkIndex(0);
    };

    const nextParagraph = () => {
        if (!paragraphs.length) return;
        const nextIdx = Math.min(paragraphs.length - 1, currentChunkIndex + 1);
        speakChunk(nextIdx);
    };

    const prevParagraph = () => {
        if (!paragraphs.length) return;
        const prevIdx = Math.max(0, currentChunkIndex - 1);
        speakChunk(prevIdx);
    };

    const setVoice = (voiceURI) => {
        setSelectedVoiceURI(voiceURI);
        localStorage.setItem("cbr_narrator_voice", voiceURI);
        if (isPlaying) {
            speakChunk(currentChunkIndex);
        }
    };

    const setRate = (newRate) => {
        setRateState(newRate);
        localStorage.setItem("cbr_narrator_rate", newRate.toString());
        if (isPlaying) {
            speakChunk(currentChunkIndex);
        }
    };

    const setPitch = (newPitch) => {
        setPitchState(newPitch);
        localStorage.setItem("cbr_narrator_pitch", newPitch.toString());
        if (isPlaying) {
            speakChunk(currentChunkIndex);
        }
    };

    const progressPercent = useMemo(() => {
        if (!paragraphs.length) return 0;
        return Math.min(100, Math.round((currentChunkIndex / paragraphs.length) * 100));
    }, [currentChunkIndex, paragraphs.length]);

    const activeVoice = useMemo(
        () => voices.find((v) => v.voiceURI === selectedVoiceURI),
        [voices, selectedVoiceURI]
    );

    return (
        <AudioContext.Provider
            value={{
                isSupported,
                voices,
                selectedVoiceURI,
                activeVoice,
                currentTrack,
                paragraphs,
                currentChunkIndex,
                isPlaying,
                isPaused,
                rate,
                pitch,
                progressPercent,
                playTrack,
                togglePlayPause,
                stopTrack,
                nextParagraph,
                prevParagraph,
                setVoice,
                setRate,
                setPitch
            }}
        >
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudio must be used within an AudioProvider");
    }
    return context;
}
