"use client";

import Link from "next/link";
import { MessageSquare, Heart, Eye, FileText, GraduationCap, Sparkles, Building, Clock } from "lucide-react";

export default function CommunityCard({ post, onLikeToggle }) {
    const isThesis = post.type === "thesis";

    const getTypeBadge = (type) => {
        switch (type) {
            case "thesis":
                return {
                    label: "Chemical Thesis",
                    icon: <GraduationCap className="w-3.5 h-3.5" />,
                    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
                };
            case "article":
                return {
                    label: "Industry Article",
                    icon: <FileText className="w-3.5 h-3.5" />,
                    classes: "bg-blue-50 text-blue-700 border-blue-200/80",
                };
            case "case-study":
                return {
                    label: "Plant Case Study",
                    icon: <Building className="w-3.5 h-3.5" />,
                    classes: "bg-purple-50 text-purple-700 border-purple-200/80",
                };
            default:
                return {
                    label: "Public Talk",
                    icon: <MessageSquare className="w-3.5 h-3.5" />,
                    classes: "bg-amber-50 text-amber-800 border-amber-200/80",
                };
        }
    };

    const typeInfo = getTypeBadge(post.type);

    return (
        <article className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300/80 transition-all duration-300 flex flex-col justify-between">
            <div>
                {/* Top Row: Type & Category + Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeInfo.classes}`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {post.category}
                        </span>
                    </div>

                    <div className="flex items-center text-xs text-slate-400 gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                </div>

                {/* Title */}
                <Link href={`/chemtalk/${post.slug}`}>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2.5">
                        {post.title}
                    </h3>
                </Link>

                {/* Abstract or Excerpt */}
                <p className="text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4">
                    {post.abstract || post.content?.replace(/<[^>]*>/g, "").slice(0, 180) + "..."}
                </p>

                {/* Tags if any */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Row: Author & Engagement stats */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 mt-auto">
                {/* Author Credentials */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden shrink-0">
                        {post.authorPhoto ? (
                            <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                            <span>{post.authorName?.charAt(0)?.toUpperCase() || "C"}</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                            {post.authorName}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[170px] sm:max-w-[220px]">
                            {post.authorAffiliation || "Researcher / Chemist"}
                        </span>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <button
                        type="button"
                        onClick={() => onLikeToggle && onLikeToggle(post._id)}
                        className="flex items-center gap-1.5 hover:text-red-500 transition-colors group/like"
                    >
                        <Heart className="w-4 h-4 group-hover/like:scale-110 transition-transform" />
                        <span>{post.likeCount || 0}</span>
                    </button>
                    <Link href={`/chemtalk/${post.slug}#comments`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentCount || 0}</span>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span>{post.views || 0}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
