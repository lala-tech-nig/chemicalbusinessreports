"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Youtube, ExternalLink, Loader2, Search, TrendingUp, Eye } from "lucide-react";

const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "UCxxxxxxxxxxxxxxxx"; // Replace with real channel ID
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ""; // Set in .env.local

const FALLBACK_VIDEOS = [
    {
        id: "dQw4w9WgXcQ",
        title: "Chemical Business Reports — Channel Introduction",
        description: "Welcome to Chemical Business Reports — your trusted source for chemical industry insights, market reports, and executive interviews.",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        publishedAt: "2024-01-01T00:00:00Z",
        viewCount: "1200",
    },
];

function formatViews(n) {
    if (!n) return "";
    const num = parseInt(n);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
    return `${num} views`;
}

function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function YouTubePage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [autoplay, setAutoplay] = useState(true);
    const playerRef = useRef(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    async function fetchVideos() {
        setLoading(true);
        try {
            if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "") {
                // No API key — use fallback
                setVideos(FALLBACK_VIDEOS);
                setLoading(false);
                return;
            }

            // 1. Get the uploads playlist for this channel
            const channelRes = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
            );
            const channelData = await channelRes.json();
            const playlistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
            if (!playlistId) throw new Error("Could not find uploads playlist");

            // 2. Get up to 50 videos from the uploads playlist
            const playlistRes = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
            );
            const playlistData = await playlistRes.json();
            const items = playlistData.items || [];

            // 3. Get statistics for each video
            const videoIds = items.map(i => i.snippet.resourceId.videoId).join(",");
            let statsMap = {};
            if (videoIds) {
                const statsRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
                );
                const statsData = await statsRes.json();
                (statsData.items || []).forEach(v => { statsMap[v.id] = v.statistics; });
            }

            const formattedVideos = items.map(item => ({
                id: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail:
                    item.snippet.thumbnails?.maxres?.url ||
                    item.snippet.thumbnails?.high?.url ||
                    item.snippet.thumbnails?.default?.url,
                publishedAt: item.snippet.publishedAt,
                viewCount: statsMap[item.snippet.resourceId.videoId]?.viewCount,
                likeCount: statsMap[item.snippet.resourceId.videoId]?.likeCount,
            }));

            setVideos(formattedVideos);
        } catch (err) {
            console.error("[YouTube] Fetch error:", err);
            setError("Could not load videos from YouTube. Showing channel page.");
            setVideos(FALLBACK_VIDEOS);
        } finally {
            setLoading(false);
        }
    }

    const filteredVideos = videos.filter(v =>
        v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const featuredVideo = filteredVideos[0];
    const restVideos = filteredVideos.slice(1);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-900 via-gray-900 to-gray-950 py-20 px-4">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-20 w-64 h-64 rounded-full bg-red-500 blur-3xl" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-red-700 blur-3xl" />
                </div>
                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg mb-6 shadow-xl"
                    >
                        <Youtube className="w-6 h-6" />
                        Chemical Business Reports
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black mb-4 leading-tight"
                    >
                        Our YouTube Channel
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-300 text-lg max-w-2xl mx-auto mb-8"
                    >
                        Watch in-depth market reports, executive interviews, and chemical industry insights — all in one place.
                    </motion.p>
                    <motion.a
                        href={`https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-full transition-colors shadow-xl"
                    >
                        <Youtube className="w-5 h-5" />
                        Subscribe on YouTube
                        <ExternalLink className="w-4 h-4" />
                    </motion.a>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 pb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No videos found.</div>
                ) : (
                    <>
                        {/* Featured Video */}
                        {featuredVideo && (
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-red-500" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-red-400">Latest Video</span>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl cursor-pointer group"
                                    onClick={() => setActiveVideo(featuredVideo)}
                                >
                                    <div className="relative aspect-video">
                                        <img
                                            src={featuredVideo.thumbnail}
                                            alt={featuredVideo.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl"
                                            >
                                                <Play className="w-9 h-9 text-white ml-1" fill="white" />
                                            </motion.div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{featuredVideo.title}</h2>
                                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                                            {featuredVideo.viewCount && (
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {formatViews(featuredVideo.viewCount)}
                                                </span>
                                            )}
                                            <span>{formatDate(featuredVideo.publishedAt)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Video Grid */}
                        {restVideos.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold mb-6 text-white">More Videos</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {restVideos.map((video, index) => (
                                        <motion.div
                                            key={video.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer group hover:bg-gray-800 transition-colors border border-gray-800 hover:border-red-900"
                                            onClick={() => setActiveVideo(video)}
                                        >
                                            <div className="relative aspect-video">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                                                        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">{video.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {video.viewCount && <span>{formatViews(video.viewCount)}</span>}
                                                    <span>{formatDate(video.publishedAt)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Video Modal Player */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setActiveVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <X className="w-5 h-5" /> Close
                            </button>
                            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
                                <iframe
                                    ref={playerRef}
                                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                                    title={activeVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="mt-4 px-1">
                                <h3 className="text-white font-bold text-lg">{activeVideo.title}</h3>
                                {activeVideo.viewCount && (
                                    <p className="text-gray-400 text-sm mt-1">{formatViews(activeVideo.viewCount)} · {formatDate(activeVideo.publishedAt)}</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
