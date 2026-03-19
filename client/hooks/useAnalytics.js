"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const API_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api"
        : "https://chemicalbusinessreports.onrender.com/api";

function getOrCreateSessionId() {
    if (typeof window === "undefined") return null;
    let sid = sessionStorage.getItem("cbr_sid");
    if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("cbr_sid", sid);
    }
    return sid;
}

async function fetchPublicIP() {
    try {
        const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
        const data = await res.json();
        return data.ip;
    } catch {
        return "unknown";
    }
}

export function useAnalytics() {
    const pathname = usePathname();
    const ipRef = useRef(null);
    const sessionIdRef = useRef(null);
    const pageStartRef = useRef(Date.now());

    // Initialize session and IP once
    useEffect(() => {
        if (typeof window === "undefined") return;
        sessionIdRef.current = getOrCreateSessionId();

        fetchPublicIP().then((ip) => {
            ipRef.current = ip;
        });
    }, []);

    // Core send function
    const sendEvent = useCallback(async (eventType, payload) => {
        if (!sessionIdRef.current) return;
        // Wait until we have an IP (max 3s delay)
        if (!ipRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (!ipRef.current) return;
        }

        try {
            fetch(`${API_URL}/analytics/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionIdRef.current,
                    ip: ipRef.current,
                    userAgent: navigator.userAgent,
                    event: { type: eventType, payload }
                }),
                keepalive: true
            });
        } catch (err) {
            // Silently fail — never disrupt UX
        }
    }, []);

    // Track page visits and time spent on each page
    useEffect(() => {
        if (!pathname) return;
        pageStartRef.current = Date.now();

        // Send page_visit event
        sendEvent("page_visit", { path: pathname });

        // On pathname change or unmount, send time_spent for the previous page
        return () => {
            const seconds = Math.round((Date.now() - pageStartRef.current) / 1000);
            if (seconds > 1) {
                sendEvent("time_spent", { seconds, path: pathname });
            }
        };
    }, [pathname, sendEvent]);

    // Track visible time (tab switch / close)
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "hidden") {
                const seconds = Math.round((Date.now() - pageStartRef.current) / 1000);
                if (seconds > 1) {
                    sendEvent("session_end", { seconds, path: pathname });
                    // Reset to avoid double-counting if user comes back
                    pageStartRef.current = Date.now();
                }
            } else {
                // Tab became visible again — reset start
                pageStartRef.current = Date.now();
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [pathname, sendEvent]);

    // Helper: track a specific button/link click
    const trackButton = useCallback(
        (label, path = pathname) => {
            sendEvent("button_click", { label, path });
        },
        [pathname, sendEvent]
    );

    // Helper: track a post interaction
    const trackPost = useCallback(
        (postSlug, postTitle, action = "view") => {
            sendEvent("post_interaction", { postSlug, postTitle, action });
        },
        [sendEvent]
    );

    return { trackButton, trackPost, sendEvent };
}
