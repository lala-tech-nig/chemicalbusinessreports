"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Headphones, ArrowUpRight, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CATEGORY_COLORS = {
    "News Roundup": { bg: "from-blue-600 to-blue-800", badge: "bg-blue-600", dot: "bg-blue-400" },
    "Chemical Mart": { bg: "from-emerald-600 to-teal-800", badge: "bg-emerald-600", dot: "bg-emerald-400" },
    "Research & Reports": { bg: "from-violet-600 to-purple-800", badge: "bg-violet-600", dot: "bg-violet-400" },
    "Corporate Profile": { bg: "from-orange-600 to-amber-800", badge: "bg-orange-600", dot: "bg-orange-400" },
    "Start Up": { bg: "from-pink-600 to-rose-800", badge: "bg-pink-600", dot: "bg-pink-400" },
    "Executive Brief": { bg: "from-slate-600 to-gray-800", badge: "bg-slate-600", dot: "bg-slate-400" },
    default: { bg: "from-blue-700 to-blue-900", badge: "bg-blue-700", dot: "bg-blue-400" },
};

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
    className,
    subcategory
}) {
    const rawExcerpt = excerpt || (content ? content.replace(/<[^>]*>/g, '').trim().slice(0, 120) + (content.length > 120 ? '...' : '') : "");
    const formattedDate = date || (createdAt ? new Date(createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "");
    const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
    const categoryLabel = category === "News Roundup" && subcategory ? `${category} / ${subcategory}` : category;

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/posts/${slug}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!", { duration: 2000 });
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className={cn("group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300", className)}
        >
            {/* Image Area */}
            <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {image ? (
                    <Image
                        src={image}
                        alt={title || "Article Image"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                        <span className="text-white/40 text-xs font-medium tracking-widest uppercase">Chemical Business Reports</span>
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className={`absolute top-3 left-3 ${colors.badge} text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-sm`}>
                    {categoryLabel}
                </div>

                {/* Audio Badge */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-[9px] font-medium px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow">
                    <Headphones className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="hidden sm:inline">Audio</span>
                </div>

                {/* Share button - hover reveal */}
                <motion.button
                    onClick={handleShare}
                    title="Copy link"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-600"
                >
                    <Share2 className="w-3.5 h-3.5" />
                </motion.button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 flex flex-col gap-2">
                {/* Meta row */}
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    {formattedDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formattedDate}</span>
                        </div>
                    )}
                    {author && (
                        <div className="flex items-center gap-1.5 ml-auto">
                            {authorPhoto ? (
                                <img src={authorPhoto} alt={author} className="w-4 h-4 rounded-full object-cover border border-gray-200 shrink-0" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                                    <User className="w-2.5 h-2.5 text-gray-400" />
                                </div>
                            )}
                            <span className="truncate max-w-[100px] font-medium text-gray-500">{author}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
                    <Link href={`/posts/${slug}`}>
                        <span className="absolute inset-0" />
                        {title}
                    </Link>
                </h3>

                {/* Excerpt */}
                {rawExcerpt && (
                    <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
                        {rawExcerpt}
                    </p>
                )}

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-blue-600 text-[11px] sm:text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        {category === "News Roundup" ? "Read Summary" : "Read Article"}
                        <ArrowUpRight className="w-3 h-3" />
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
                </div>
            </div>
        </motion.div>
    );
}
