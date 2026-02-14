import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InFeedAd({ ad, className }) {
    if (!ad) return null;

    const getAdLink = () => {
        if (ad.actionType === 'whatsapp' && ad.whatsappNumber) {
            return `https://wa.me/${ad.whatsappNumber}`;
        }
        return ad.link || "#";
    };

    const targetLink = getAdLink();

    return (
        <div className={cn("group relative w-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow", className)}>
            <div className="absolute top-2 right-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                Ad
            </div>

            <a href={targetLink} target="_blank" rel="noopener noreferrer" className="relative block w-full aspect-[4/3] md:aspect-[16/10]">
                {ad.image ? (
                    <Image
                        src={ad.image}
                        alt={ad.title || "Advertisement"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-sm">Advertisement</span>
                    </div>
                )}
            </a>
        </div>
    );
}
