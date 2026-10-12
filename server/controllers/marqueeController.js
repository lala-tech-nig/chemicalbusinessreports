const Marquee = require("../models/Marquee");
const Post = require("../models/Post");

// Default starter items if database is clean
const defaultItems = [
    {
        text: "Welcome to Chemical Business Reports — Africa & Global Chemical Market Intelligence.",
        link: "/",
        badge: "WELCOME",
        isActive: true,
    },
    {
        text: "Global Petrochemical & Industrial Trends 2026: Supply chain dynamics, pricing analysis, and policy briefs.",
        link: "/posts/research-reports",
        badge: "MARKET INSIGHT",
        isActive: true,
    },
    {
        text: "Explore Chemical Business Mart: Verified suppliers, chemicals, and laboratory equipment directory.",
        link: "/posts/chemical-mart",
        badge: "DIRECTORY",
        isActive: true,
    }
];

// @desc    Get Marquee configuration & active items (Public)
// @route   GET /api/marquee
// @access  Public
exports.getMarqueeSettings = async (req, res) => {
    try {
        let marquee = await Marquee.findOne();

        if (!marquee) {
            marquee = await Marquee.create({
                isEnabled: true,
                label: "BREAKING NEWS",
                labelBg: "red",
                theme: "dark",
                speed: 35,
                pauseOnHover: true,
                includeLatestPosts: true,
                items: defaultItems,
            });
        }

        // Optionally fetch latest posts to supplement marquee
        let latestPosts = [];
        if (marquee.includeLatestPosts) {
            try {
                const posts = await Post.find({})
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select("title slug category createdAt");

                latestPosts = posts.map(p => ({
                    _id: p._id,
                    text: p.title,
                    link: `/posts/${p.slug}`,
                    badge: p.category || "NEWS",
                    isActive: true,
                    isPost: true,
                }));
            } catch (postErr) {
                console.error("Error fetching latest posts for marquee:", postErr);
            }
        }

        return res.json({
            success: true,
            data: {
                _id: marquee._id,
                isEnabled: marquee.isEnabled,
                label: marquee.label,
                labelBg: marquee.labelBg,
                theme: marquee.theme,
                speed: marquee.speed,
                pauseOnHover: marquee.pauseOnHover,
                includeLatestPosts: marquee.includeLatestPosts,
                items: marquee.items,
                latestPosts,
                updatedAt: marquee.updatedAt,
            }
        });
    } catch (error) {
        console.error("Error in getMarqueeSettings:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve marquee settings",
            error: error.message,
        });
    }
};

// @desc    Update Marquee configuration & items (Admin / Moderator)
// @route   PUT /api/marquee
// @access  Protected
exports.updateMarqueeSettings = async (req, res) => {
    try {
        const {
            isEnabled,
            label,
            labelBg,
            theme,
            speed,
            pauseOnHover,
            includeLatestPosts,
            items,
        } = req.body;

        let marquee = await Marquee.findOne();

        if (!marquee) {
            marquee = new Marquee({});
        }

        if (typeof isEnabled === "boolean") marquee.isEnabled = isEnabled;
        if (label !== undefined) marquee.label = label.trim();
        if (labelBg !== undefined) marquee.labelBg = labelBg;
        if (theme !== undefined) marquee.theme = theme;
        if (speed !== undefined) marquee.speed = Number(speed) || 35;
        if (typeof pauseOnHover === "boolean") marquee.pauseOnHover = pauseOnHover;
        if (typeof includeLatestPosts === "boolean") marquee.includeLatestPosts = includeLatestPosts;
        if (Array.isArray(items)) marquee.items = items;

        marquee.updatedAt = new Date();

        await marquee.save();

        return res.json({
            success: true,
            message: "Marquee settings updated successfully",
            data: marquee,
        });
    } catch (error) {
        console.error("Error in updateMarqueeSettings:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update marquee settings",
            error: error.message,
        });
    }
};
