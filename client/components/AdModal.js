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
                    setTimeout(() => setIsOpen(true), 3000);
                }
            } catch (error) {
                console.error("Failed to load ads:", error);
            }
        };

        loadAd();
    }, []);

    if (!ad) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative rounded-lg shadow-2xl max-w-lg w-full overflow-hidden bg-transparent"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-20 backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <a
                            href={ad.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative w-full aspect-[4/5] sm:aspect-square"
                        >
                            {isVideo(ad.image) ? (
                                <video
                                    src={ad.image}
                                    className="w-full h-full object-cover"
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
                                    className="object-cover"
                                    priority
                                    unoptimized={ad.image?.includes('.gif')} // GIFs might need unoptimized
                                />
                            )}
                        </a>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
