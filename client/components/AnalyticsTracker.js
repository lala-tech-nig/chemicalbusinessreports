"use client";

import { useEffect, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
    const { trackButton, sendEvent } = useAnalytics();
    const pathname = usePathname();
    const trackedRef = useRef(new Set());

    useEffect(() => {
        // Global click listener — captures all button / anchor clicks automatically
        const handleClick = (e) => {
            const target = e.target;

            // Walk up the DOM to find the nearest button or anchor
            const el = target.closest("button, a, [role='button'], [data-track]");
            if (!el) return;

            const label =
                el.getAttribute("data-track") ||
                el.getAttribute("aria-label") ||
                el.innerText?.trim()?.slice(0, 80) ||
                el.getAttribute("href") ||
                "Unknown";

            const path = pathname || window.location.pathname;

            trackButton(label, path);
        };

        document.addEventListener("click", handleClick, { passive: true });
        return () => document.removeEventListener("click", handleClick);
    }, [pathname, trackButton]);

    // Renders nothing — purely a side-effect component
    return null;
}
