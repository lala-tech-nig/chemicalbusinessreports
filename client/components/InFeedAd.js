import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InFeedAd({ ad, className }) {
    if (!ad) return null;

    const getAdLink = () => {
        if (ad.actionType === 'whatsapp' && ad.whatsappNumber) {
            const message = encodeURIComponent("hey, i saw your ad on chemicalbusinessreports website");
            return `https://wa.me/${ad.whatsappNumber}?text=${message}`;
        }
        return ad.link || "#";
    };

    const targetLink = getAdLink();

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
            }).catch(() => {});
        } catch (e) {
            // fail silently
        }
    };

    return (
        <div className={cn("group relative w-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow", className)}>

            <a href={targetLink} onClick={handleAdClick} target="_blank" rel="noopener noreferrer" className="relative block w-full aspect-[4/3] md:aspect-[16/10]">
                {ad.image ? (
                    ad.image.match(/\.(mp4|webm|mov)$/i) ? (
                        <video
                            src={ad.image}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <Image
                            src={ad.image}
                            alt={ad.title || "Advertisement"}
                            fill
                            className="object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                    )
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-sm">Advertisement</span>
                    </div>
                )}
            </a>
        </div>
    );
}
