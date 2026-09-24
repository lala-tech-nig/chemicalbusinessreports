"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Play,
    X,
    Youtube,
    ExternalLink,
    Loader2,
    Search,
    Calendar,
    Clock,
    Sparkles,
    Film,
    Share2,
    Check,
    ArrowRight,
    Shield,
} from "lucide-react";
import { fetchYouTubeVideos } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

// Graceful fallback videos if none published yet in database
const SAMPLE_VIDEOS = [
    {
        _id: "sample-1",
        videoId: "dQw4w9WgXcQ",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Chemical Business Reports — Market Intelligence & Insights",
        narration:
            "A comprehensive overview of Chemical Business Reports: delivering timely industry reports, market trends, executive perspectives, and actionable intelligence across African and global chemical sectors.",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        author: "Chemical Business Reports",
        publishedAt: new Date().toISOString(),
    },
];

export default function YouTubePage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        try {
            const token = localStorage.getItem("adminToken");
            const role = localStorage.getItem("adminRole");
            if (token || role === "admin") {
                setIsAdmin(true);
            }
        } catch (e) {
            // ignore
        }
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const data = await fetchYouTubeVideos();
            if (Array.isArray(data) && data.length > 0) {
                setVideos(data);
            } else {
                setVideos(SAMPLE_VIDEOS);
            }
        } catch (error) {
            console.warn("Using sample videos fallback:", error);
            setVideos(SAMPLE_VIDEOS);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (e, video) => {
        e.stopPropagation();
        const url = video.youtubeUrl || `https://www.youtube.com/watch?v=${video.videoId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(video._id);
            toast.success("YouTube link copied to clipboard!");
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(() => toast.error("Failed to copy link"));
    };

    const filteredVideos = useMemo(() => {
        if (!searchQuery.trim()) return videos;
        const q = searchQuery.toLowerCase();
        return videos.filter(
            (v) =>
                v.title?.toLowerCase().includes(q) ||
                v.narration?.toLowerCase().includes(q) ||
                v.author?.toLowerCase().includes(q)
        );
    }, [videos, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50/60 pb-24">
            {/* ── Hero Banner (Matching Existing Blue Design) ── */}
            <section className="relative bg-gradient-to-br from-primary via-blue-700 to-sky-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background decorative blurs */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
                    <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-sky-300 blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold uppercase tracking-wider text-sky-200">
                                <Youtube className="w-3.5 h-3.5 text-red-400" />
                                <span>CBR Media & Video Reports</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                Video Insights & Market Reports
                            </h1>
                            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
                                Curated video briefings, expert interviews, and executive summaries narrating the latest developments across the chemical and petrochemical industries.
                            </p>
                        </div>

                        {/* Search & Admin Quick Action */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
                                <input
                                    type="text"
                                    placeholder="Search video reports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {isAdmin && (
                                <Link
                                    href="/admin/youtube"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary text-xs font-bold rounded-xl hover:bg-white/90 transition-all shadow-md shrink-0"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Manage Videos</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Main Content Area: Video Cards with Little Narration ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Stats / Results Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <Film className="w-4 h-4 text-primary" />
                        <span>
                            {filteredVideos.length} Video Report{filteredVideos.length !== 1 ? "s" : ""} Available
                        </span>
                        {searchQuery && (
                            <span className="text-primary font-normal">
                                for &ldquo;{searchQuery}&rdquo;
                            </span>
                        )}
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium">
                        Click any video card to play instantly with full narration
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                        <p className="text-sm font-semibold text-gray-500">Loading video reports...</p>
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-8 shadow-sm">
                        <Youtube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-800">No videos match your search</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            Try searching with different keywords or clear the search filter above.
                        </p>
                    </div>
                ) : (
                    /* ── Video Cards Grid ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {filteredVideos.map((video) => (
                            <article
                                key={video._id}
                                onClick={() => setActiveVideo(video)}
                                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
                            >
                                {/* Thumbnail Container */}
                                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                                            <Play className="w-12 h-12 text-red-500 fill-red-500" />
                                        </div>
                                    )}

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center transition-opacity">
                                        <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                                            <Play className="w-6 h-6 fill-white ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Top Badges */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold">
                                            <Youtube className="w-3 h-3 text-red-500 fill-red-500" />
                                            <span>YouTube</span>
                                        </span>
                                    </div>

                                    {/* Share Button */}
                                    <button
                                        onClick={(e) => handleShare(e, video)}
                                        className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                                            copiedId === video._id
                                                ? "bg-green-500 text-white"
                                                : "bg-black/60 text-white/80 hover:text-white hover:bg-black/90"
                                        }`}
                                        title="Copy YouTube Link"
                                    >
                                        {copiedId === video._id ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            <Share2 className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>

                                {/* Content Body */}
                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2.5">
                                        {/* Caption / Title */}
                                        <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                            {video.title}
                                        </h3>

                                        {/* Little Narration */}
                                        {video.narration ? (
                                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                                {video.narration}
                                            </p>
                                        ) : (
                                            <p className="text-gray-400 text-xs italic">
                                                Click to play this report video.
                                            </p>
                                        )}
                                    </div>

                                    {/* Footer Details */}
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            <span>
                                                {new Date(video.publishedAt || video.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>

                                        <span className="inline-flex items-center gap-1 font-bold text-primary text-xs group-hover:translate-x-0.5 transition-transform">
                                            <span>Watch Video</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Interactive Video Player Modal with Full Narration ── */}
            {activeVideo && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={() => setActiveVideo(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 16:9 YouTube Player */}
                        <div className="relative aspect-video bg-black">
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                                title={activeVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full border-0"
                            />
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors z-20"
                                title="Close player"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Narration & Details */}
                        <div className="p-6 sm:p-8 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full mb-2">
                                        <Youtube className="w-3.5 h-3.5" />
                                        <span>Chemical Business Reports Video</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                                        {activeVideo.title}
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        Published on{" "}
                                        {new Date(activeVideo.publishedAt || activeVideo.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <a
                                        href={activeVideo.youtubeUrl || `https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                                    >
                                        <span>Open on YouTube</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Narration Section */}
                            {activeVideo.narration && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                        Video Narration & Report Summary
                                    </h4>
                                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                                        {activeVideo.narration}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
