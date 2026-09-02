import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PostCard({ 
    title, 
    excerpt, 
    content,
    image, 
    category, 
    date, 
    createdAt,
    author, 
    authorPhoto, 
    slug, 
    excerptColor, 
    excerptTextColor,
    className, 
    subcategory 
}) {
    // Generate fallback text excerpt if explicit excerpt is missing
    const rawExcerpt = excerpt || (content ? content.replace(/<[^>]*>/g, '').trim().slice(0, 160) + (content.length > 160 ? '...' : '') : "");
    const formattedDate = date || (createdAt ? new Date(createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "");

    return (
        <div className={cn("group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow", className)}>
            <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden bg-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={title || "Article Image"}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-102"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-muted-foreground">
                        <span className="text-xs sm:text-sm">Chemical Business Reports</span>
                    </div>
                )}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-primary/90 text-primary-foreground text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                    {category === "News Roundup" && subcategory ? `${category} / ${subcategory}` : category}
                </div>

                <div title="Audio Narration Available" className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/60 text-white text-[9px] sm:text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Headphones className="w-3 h-3 text-emerald-400" />
                    <span className="hidden sm:inline">Audio</span>
                </div>
            </div>

            <div className="flex-1 p-3 sm:p-5 flex flex-col">
                <div className="flex items-center text-[11px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 space-x-3">
                    {formattedDate && (
                        <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formattedDate}
                        </div>
                    )}
                    {author && (
                        <div className="flex items-center">
                            {authorPhoto ? (
                                <div className="relative w-5 h-5 sm:w-6 sm:h-6 mr-1.5 shadow-sm border border-border rounded-full overflow-hidden shrink-0">
                                    <img
                                        src={authorPhoto}
                                        alt={author}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5 rounded-full bg-muted flex items-center justify-center border border-border shrink-0">
                                    <User className="w-3 h-3 text-muted-foreground" />
                                </div>
                            )}
                            <span className="font-medium truncate max-w-[120px] sm:max-w-none">{author}</span>
                        </div>
                    )}
                </div>

                <h3 className="text-sm sm:text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    <Link href={`/posts/${slug}`}>
                        <span className="absolute inset-0" />
                        {title}
                    </Link>
                </h3>

                {rawExcerpt ? (
                    <p
                        className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-1 px-2.5 py-1.5 rounded-md leading-relaxed"
                        style={{
                            backgroundColor: excerptColor || '#f8fafc',
                            color: excerptTextColor || (excerptColor ? '#1a1a1a' : '#475569'),
                        }}
                    >
                        {rawExcerpt}
                    </p>
                ) : null}

                <div className="mt-auto pt-2 sm:pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-primary text-xs sm:text-sm font-medium group-hover:underline">
                        {category === "News Roundup" ? "Read Summary →" : "Read Article →"}
                    </span>
                </div>
            </div>
        </div>
    );
}
