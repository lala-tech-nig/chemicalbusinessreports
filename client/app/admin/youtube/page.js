"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Youtube,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    ExternalLink,
    Play,
    UploadCloud,
    Check,
    X,
    Sparkles,
    Eye,
} from "lucide-react";
import {
    fetchYouTubeVideos,
    fetchYouTubeInfo,
    createYouTubeVideo,
    updateYouTubeVideo,
    deleteYouTubeVideo,
    uploadFile,
} from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

// Helper to extract video ID client-side as well for instant thumbnail resolution
function getYouTubeId(url = "") {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
    return match ? match[1] : null;
}

export default function AdminYouTubePage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [fetchingInfo, setFetchingInfo] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        youtubeUrl: "",
        title: "",
        narration: "",
        thumbnail: "",
        thumbnailType: "youtube", // "youtube" | "custom"
        isFeatured: false,
    });

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const data = await fetchYouTubeVideos();
            setVideos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load YouTube videos", error);
            toast.error("Failed to load videos");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingVideo(null);
        setForm({
            youtubeUrl: "",
            title: "",
            narration: "",
            thumbnail: "",
            thumbnailType: "youtube",
            isFeatured: false,
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (video) => {
        setEditingVideo(video);
        setForm({
            youtubeUrl: video.youtubeUrl || `https://www.youtube.com/watch?v=${video.videoId}`,
            title: video.title || "",
            narration: video.narration || "",
            thumbnail: video.thumbnail || "",
            thumbnailType: video.thumbnail?.includes("cloudinary") ? "custom" : "youtube",
            isFeatured: Boolean(video.isFeatured),
        });
        setIsModalOpen(true);
    };

    // Auto-fetch thumbnail and caption when YouTube link is entered/pasted
    const handleUrlChange = async (url) => {
        setForm((prev) => ({ ...prev, youtubeUrl: url }));

        const videoId = getYouTubeId(url);
        if (!videoId) return;

        // Immediately auto-fill the standard YouTube thumbnail
        const defaultThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        setForm((prev) => ({
            ...prev,
            thumbnail: prev.thumbnailType === "custom" && prev.thumbnail ? prev.thumbnail : defaultThumb,
        }));

        // Fetch oEmbed title & maxres thumbnail from backend
        setFetchingInfo(true);
        try {
            const info = await fetchYouTubeInfo(url);
            setForm((prev) => ({
                ...prev,
                // If title is empty or hasn't been manually typed yet, inherit title from YouTube
                title: prev.title ? prev.title : info.title || "",
                thumbnail: prev.thumbnailType === "custom" && prev.thumbnail ? prev.thumbnail : (info.thumbnail || defaultThumb),
            }));
            toast.success("Thumbnail & title inherited from YouTube!", { duration: 2500 });
        } catch (err) {
            // Non-fatal, default thumb already set
        } finally {
            setFetchingInfo(false);
        }
    };

    // Upload custom thumbnail
    const handleCustomThumbnailUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingThumb(true);
        try {
            const uploaded = await uploadFile(file);
            setForm((prev) => ({
                ...prev,
                thumbnail: uploaded.url,
                thumbnailType: "custom",
            }));
            toast.success("Custom thumbnail uploaded successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to upload thumbnail");
        } finally {
            setUploadingThumb(false);
        }
    };

    // Submit form (create or edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.youtubeUrl.trim() || !form.title.trim()) {
            toast.error("Please enter a YouTube link and caption/title");
            return;
        }

        const videoId = getYouTubeId(form.youtubeUrl);
        if (!videoId) {
            toast.error("Invalid YouTube URL. Please paste a valid link.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                youtubeUrl: form.youtubeUrl.trim(),
                title: form.title.trim(),
                narration: form.narration.trim(),
                thumbnail: form.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                isFeatured: form.isFeatured,
            };

            if (editingVideo) {
                const updated = await updateYouTubeVideo(editingVideo._id, payload);
                setVideos((prev) => prev.map((v) => (v._id === editingVideo._id ? updated : v)));
                toast.success("Video post updated successfully!");
            } else {
                const created = await createYouTubeVideo(payload);
                setVideos((prev) => [created, ...prev]);
                toast.success("YouTube video published successfully!");
            }

            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to save video post");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this YouTube video post?")) return;
        try {
            await deleteYouTubeVideo(id);
            setVideos((prev) => prev.filter((v) => v._id !== id));
            toast.success("Video post deleted");
        } catch (error) {
            toast.error(error.message || "Failed to delete video post");
        }
    };

    const filteredVideos = useMemo(() => {
        if (!searchTerm.trim()) return videos;
        const q = searchTerm.toLowerCase();
        return videos.filter(
            (v) =>
                v.title?.toLowerCase().includes(q) ||
                v.narration?.toLowerCase().includes(q)
        );
    }, [videos, searchTerm]);

    const activeVideoId = getYouTubeId(form.youtubeUrl);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Youtube className="w-7 h-7 text-red-600" />
                        <span>YouTube Video Hub</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Publish, edit, and curate video cards with custom or inherited narration.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add YouTube Video</span>
                </button>
            </div>

            {/* Search and Count Bar */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search videos by caption or narration..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div className="text-xs text-muted-foreground font-semibold">
                    Showing {filteredVideos.length} of {videos.length} videos
                </div>
            </div>

            {/* Video Cards Grid in Admin */}
            {loading ? (
                <div className="flex justify-center p-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="p-16 text-center bg-card border border-dashed border-border rounded-2xl">
                    <Youtube className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <h3 className="font-bold text-foreground text-base">No video posts found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        {searchTerm
                            ? "No videos match your search query."
                            : "Click '+ Add YouTube Video' above to paste a YouTube link and publish your first video."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <div
                            key={video._id}
                            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                        >
                            {/* Thumbnail Preview */}
                            <div className="relative aspect-video bg-black/5 overflow-hidden">
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                        <Play className="w-10 h-10 text-red-500 fill-red-500" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Play className="w-5 h-5 fill-white ml-0.5" />
                                    </div>
                                </div>
                                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                                    YouTube
                                </span>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-snug">
                                        {video.title}
                                    </h3>
                                    {video.narration ? (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                                            {video.narration}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground/60 italic mt-1.5">
                                            No narration added.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {new Date(video.publishedAt || video.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={video.youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Watch on YouTube"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => handleOpenEdit(video)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Edit Video Post"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(video._id)}
                                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Video Post"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                    <Youtube className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">
                                        {editingVideo ? "Edit YouTube Video" : "Publish YouTube Video"}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Paste any YouTube link to automatically populate thumbnail and caption.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* 1. YouTube Link */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                                    YouTube Video Link <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                                        value={form.youtubeUrl}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10"
                                    />
                                    {fetchingInfo && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                    <span>Pasting a link will automatically fetch its thumbnail and caption.</span>
                                </p>
                            </div>

                            {/* 2. Caption / Title */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                                    Video Caption / Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter caption or use inherited YouTube title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Inherited from YouTube. You can customize or write your own caption.
                                </p>
                            </div>

                            {/* 3. Little Narration / Summary */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                                    Little Narration / Brief Description
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Write a brief narrative introducing what viewers will learn or discover in this video..."
                                    value={form.narration}
                                    onChange={(e) => setForm({ ...form, narration: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none leading-relaxed"
                                />
                            </div>

                            {/* 4. Thumbnail Mode & Preview */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                                    Video Thumbnail
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                    {/* Thumbnail Preview */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                        {form.thumbnail ? (
                                            <img
                                                src={form.thumbnail}
                                                alt="Thumbnail preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center p-4 text-muted-foreground">
                                                <Youtube className="w-8 h-8 mx-auto mb-1 opacity-40 text-red-500" />
                                                <span className="text-xs">No thumbnail yet</span>
                                            </div>
                                        )}
                                        {form.thumbnail && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-bold">
                                                {form.thumbnailType === "custom" ? "Custom" : "YouTube Auto"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Thumbnail Options */}
                                    <div className="space-y-3">
                                        {activeVideoId && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        thumbnail: `https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`,
                                                        thumbnailType: "youtube",
                                                    }))
                                                }
                                                className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                                                    form.thumbnailType === "youtube"
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-border text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                <span>Use YouTube Thumbnail</span>
                                                {form.thumbnailType === "youtube" && <Check className="w-4 h-4" />}
                                            </button>
                                        )}

                                        <div>
                                            <label
                                                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                                                    form.thumbnailType === "custom"
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                {uploadingThumb ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                ) : (
                                                    <UploadCloud className="w-4 h-4" />
                                                )}
                                                <span>
                                                    {uploadingThumb ? "Uploading..." : "Upload Custom Thumbnail"}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={uploadingThumb}
                                                    onChange={handleCustomThumbnailUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                PNG, JPG, or WEBP up to 5MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || uploadingThumb}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>{editingVideo ? "Update Video" : "Publish Video"}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
