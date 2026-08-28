"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { fetchActiveAds } from "@/lib/api";

const isVideo = (url) => {
    if (!url) return false;
    const extension = url.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov'].includes(extension);
};

export default function AdModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [ad, setAd] = useState(null);

    useEffect(() => {
        const loadAd = async () => {
            try {
                const ads = await fetchActiveAds();
                // Find the most recent active popup ad
                const popupAd = ads.find(a => a.type === "popup" && a.isActive);

                if (popupAd) {
                    setAd(popupAd);
                    // Show modal after 3 seconds if ad exists
                    setTimeout(() => setIsOpen(true), 12000);
                }
            } catch (error) {
                console.error("Failed to load ads:", error);
            }
        };

        loadAd();
    }, []);

    if (!ad) return null;

    const getAdLink = () => {
        if (ad.actionType === 'whatsapp' && ad.whatsappNumber) {
            const message = encodeURIComponent("hey, i saw your ad on chemicalbusinessreports website");
            return `https://wa.me/${ad.whatsappNumber}?text=${message}`;
        }
        return ad.link || "#";
    };

    const handleAdClick = () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : "https://chemicalbusinessreports-f078.onrender.com/api");
            let sid = typeof window !== "undefined" ? sessionStorage.getItem("cbr_sid") : null;
            if (!sid && typeof window !== "undefined") {
                sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
                sessionStorage.setItem("cbr_sid", sid);
            }

            fetch(`${API_URL}/analytics/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sid,
                    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
                    event: {
                        type: "ad_click",
                        payload: {
                            adId: ad._id,
                            adTitle: ad.title,
                            path: typeof window !== "undefined" ? window.location.pathname : "/"
                        }
                    }
                }),
                keepalive: true
            }).catch(() => { });
        } catch (e) {
            // fail silently
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden bg-black"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-20 backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <a
                            href={getAdLink()}
                            onClick={handleAdClick}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative w-full aspect-[4/5] sm:aspect-square bg-black"
                        >
                            {isVideo(ad.image) ? (
                                <video
                                    src={ad.image}
                                    className="w-full h-full object-contain"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            ) : (
                                <Image
                                    src={ad.image}
                                    alt={ad.title}
                                    fill
                                    className="object-contain"
                                    priority
                                    unoptimized={ad.image?.includes('.gif')}
                                />
                            )}
                        </a>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
