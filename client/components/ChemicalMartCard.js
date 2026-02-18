import Image from "next/image";
import { Building2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChemicalMartCard({ post, className }) {
    if (!post) return null;

    const getWhatsAppLink = () => {
        if (post.contactNumber) {
            const message = encodeURIComponent("hey, i saw your ad on chemicalbusinessreports website");
            return `https://wa.me/${post.contactNumber}?text=${message}`;
        }
        return null;
    };

    const whatsappLink = getWhatsAppLink();
    const isClickable = !!whatsappLink;

    const CardContent = () => (
        <>
            <div className="relative h-64 w-full overflow-hidden">
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.companyName || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-sm">No Image</span>
                    </div>
                )}

                {/* Ad Size Badge */}
                {post.adSize && (
                    <div className="absolute top-3 right-3 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        {post.adSize} Ad
                    </div>
                )}

                {/* Subcategory Badge */}
                {post.subcategory && (
                    <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.subcategory}
                    </div>
                )}
            </div>

            <div className="p-4 bg-card border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-lg line-clamp-1">{post.companyName}</h3>
                </div>
                {post.productName && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.productName}
                    </p>
                )}
                {isClickable && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-xs text-primary font-medium group-hover:underline">
                            Contact via WhatsApp →
                        </span>
                    </div>
                )}
            </div>
        </>
    );

    if (isClickable) {
        return (
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer",
                    className
                )}
            >
                <CardContent />
            </a>
        );
    }

    return (
        <div
            className={cn(
                "group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm",
                className
            )}
        >
            <CardContent />
        </div>
    );
}
