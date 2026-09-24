const YouTubePost = require("../models/YouTubePost");

/**
 * Robust extraction of YouTube Video ID from any standard or shortened YouTube URL:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
function extractYouTubeVideoId(url = "") {
    if (!url || typeof url !== "string") return null;
    const cleanUrl = url.trim();
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/;
    const match = cleanUrl.match(regExp);
    return match ? match[1] : null;
}

/**
 * @desc    Fetch video info from YouTube oEmbed (Title, Default Thumbnail, Author)
 * @route   GET /api/youtube/info?url=...
 * @access  Public / Admin helper
 */
exports.getVideoInfo = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ message: "YouTube URL is required" });
        }

        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            return res.status(400).json({ message: "Invalid YouTube URL. Could not extract video ID." });
        }

        const defaultThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const maxresThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // Fetch oEmbed details from YouTube
        let title = "";
        let author = "Chemical Business Reports";
        let oembedThumbnail = "";

        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const oembedRes = await fetch(oembedUrl);
            if (oembedRes.ok) {
                const data = await oembedRes.json();
                title = data.title || "";
                author = data.author_name || author;
                oembedThumbnail = data.thumbnail_url || "";
            }
        } catch (e) {
            console.warn("YouTube oEmbed fetch error (non-fatal):", e.message);
        }

        return res.json({
            videoId,
            title,
            author,
            thumbnail: oembedThumbnail || maxresThumbnail || defaultThumbnail,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch YouTube info" });
    }
};

/**
 * @desc    Get all YouTube video posts (with optional search)
 * @route   GET /api/youtube
 * @access  Public
 */
exports.getVideos = async (req, res) => {
    try {
        const { search, limit } = req.query;
        const query = {};

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { title: regex },
                { narration: regex },
                { author: regex },
            ];
        }

        let dbQuery = YouTubePost.find(query).sort({ publishedAt: -1, createdAt: -1 });
        if (limit && !isNaN(parseInt(limit))) {
            dbQuery = dbQuery.limit(parseInt(limit));
        }

        const videos = await dbQuery.exec();
        return res.json(videos);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single YouTube video post by ID
 * @route   GET /api/youtube/:id
 * @access  Public
 */
exports.getVideoById = async (req, res) => {
    try {
        const video = await YouTubePost.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: "Video post not found" });
        }
        return res.json(video);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create a new YouTube video post
 * @route   POST /api/youtube
 * @access  Private (Admin / Mod)
 */
exports.createVideo = async (req, res) => {
    try {
        const { youtubeUrl, title, narration, thumbnail, author, isFeatured, publishedAt } = req.body;

        if (!youtubeUrl || !youtubeUrl.trim()) {
            return res.status(400).json({ message: "YouTube URL is required" });
        }

        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
            return res.status(400).json({ message: "Invalid YouTube URL. Please provide a valid link." });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Caption/title is required" });
        }

        // Default thumbnail if none provided
        const resolvedThumbnail = thumbnail && thumbnail.trim()
            ? thumbnail.trim()
            : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        const newVideo = new YouTubePost({
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            videoId,
            title: title.trim(),
            narration: narration ? narration.trim() : "",
            thumbnail: resolvedThumbnail,
            author: author && author.trim() ? author.trim() : "Chemical Business Reports",
            isFeatured: Boolean(isFeatured),
            publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        });

        const savedVideo = await newVideo.save();
        return res.status(201).json(savedVideo);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Update a YouTube video post
 * @route   PUT /api/youtube/:id
 * @access  Private (Admin / Mod)
 */
exports.updateVideo = async (req, res) => {
    try {
        const video = await YouTubePost.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: "Video post not found" });
        }

        const { youtubeUrl, title, narration, thumbnail, author, isFeatured, publishedAt } = req.body;

        if (youtubeUrl) {
            const videoId = extractYouTubeVideoId(youtubeUrl);
            if (videoId) {
                video.videoId = videoId;
                video.youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
            }
        }

        if (title !== undefined) video.title = title.trim();
        if (narration !== undefined) video.narration = narration.trim();
        if (thumbnail !== undefined) video.thumbnail = thumbnail.trim();
        if (author !== undefined) video.author = author.trim();
        if (isFeatured !== undefined) video.isFeatured = Boolean(isFeatured);
        if (publishedAt) video.publishedAt = new Date(publishedAt);

        const updatedVideo = await video.save();
        return res.json(updatedVideo);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Delete a YouTube video post
 * @route   DELETE /api/youtube/:id
 * @access  Private (Admin / Mod)
 */
exports.deleteVideo = async (req, res) => {
    try {
        const video = await YouTubePost.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: "Video post not found" });
        }

        await YouTubePost.deleteOne({ _id: req.params.id });
        return res.json({ message: "Video post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
