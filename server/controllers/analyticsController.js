const VisitorLog = require("../models/VisitorLog");

// @desc   Track a visitor event (page visit, button click, post interaction, time spent)
// @route  POST /api/analytics/track
// @access Public
const trackEvent = async (req, res) => {
    try {
        const { sessionId, ip, userAgent, event } = req.body;

        if (!sessionId || !ip || !event || !event.type) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find existing log for this session or create new
        let log = await VisitorLog.findOne({ ip, sessionId });

        if (!log) {
            log = new VisitorLog({
                ip,
                sessionId,
                userAgent: userAgent || req.headers["user-agent"] || "",
                firstSeen: new Date(),
                lastSeen: new Date(),
                totalVisits: 1
            });
        } else {
            log.lastSeen = new Date();
        }

        // Process event types
        switch (event.type) {
            case "page_visit":
                log.pages.push({
                    path: event.payload.path,
                    visitedAt: new Date()
                });
                // Increment visit count only on new page visits
                if (log.pages.length > 1) {
                    log.totalVisits = log.pages.length;
                }
                break;

            case "button_click":
                log.buttons.push({
                    label: event.payload.label || "Unknown",
                    path: event.payload.path || "/",
                    clickedAt: new Date()
                });
                break;

            case "post_interaction":
                log.postsInteracted.push({
                    postSlug: event.payload.postSlug || "",
                    postTitle: event.payload.postTitle || "",
                    action: event.payload.action || "view",
                    at: new Date()
                });
                break;

            case "time_spent":
                log.totalTimeSpentSeconds += parseInt(event.payload.seconds) || 0;
                break;

            case "session_end":
                log.totalTimeSpentSeconds += parseInt(event.payload.seconds) || 0;
                break;

            default:
                break;
        }

        await log.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Analytics track error:", error);
        res.status(500).json({ message: "Failed to track event" });
    }
};

// @desc   Get analytics summary stats
// @route  GET /api/analytics/summary
// @access Admin only
const getSummary = async (req, res) => {
    try {
        const totalUniqueSessions = await VisitorLog.countDocuments();
        const uniqueIPs = await VisitorLog.distinct("ip");
        const totalUniqueIPs = uniqueIPs.length;

        // Total visits across all logs
        const totalVisitsResult = await VisitorLog.aggregate([
            { $group: { _id: null, total: { $sum: "$totalVisits" } } }
        ]);
        const totalVisits = totalVisitsResult[0]?.total || 0;

        // Average time spent in seconds
        const avgTimeResult = await VisitorLog.aggregate([
            { $group: { _id: null, avg: { $avg: "$totalTimeSpentSeconds" } } }
        ]);
        const avgTimeSeconds = Math.round(avgTimeResult[0]?.avg || 0);

        // Top pages
        const topPages = await VisitorLog.aggregate([
            { $unwind: "$pages" },
            { $group: { _id: "$pages.path", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top buttons
        const topButtons = await VisitorLog.aggregate([
            { $unwind: "$buttons" },
            { $group: { _id: "$buttons.label", path: { $first: "$buttons.path" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top posts interacted
        const topPosts = await VisitorLog.aggregate([
            { $unwind: "$postsInteracted" },
            {
                $group: {
                    _id: "$postsInteracted.postSlug",
                    title: { $first: "$postsInteracted.postTitle" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top IPs by visits
        const topIPs = await VisitorLog.aggregate([
            {
                $group: {
                    _id: "$ip",
                    sessions: { $sum: 1 },
                    totalVisits: { $sum: "$totalVisits" },
                    totalTime: { $sum: "$totalTimeSpentSeconds" },
                    lastSeen: { $max: "$lastSeen" }
                }
            },
            { $sort: { totalVisits: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            totalUniqueIPs,
            totalUniqueSessions,
            totalVisits,
            avgTimeSeconds,
            topPages,
            topButtons,
            topPosts,
            topIPs
        });
    } catch (error) {
        console.error("Analytics summary error:", error);
        res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
};

// @desc   Get detailed visitor logs (paginated)
// @route  GET /api/analytics/detailed
// @access Admin only
const getDetailed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const ip = req.query.ip || null;

        const filter = ip ? { ip } : {};

        const total = await VisitorLog.countDocuments(filter);
        const logs = await VisitorLog.find(filter)
            .sort({ lastSeen: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            logs
        });
    } catch (error) {
        console.error("Analytics detailed error:", error);
        res.status(500).json({ message: "Failed to fetch detailed analytics" });
    }
};

// @desc   Get all session logs for a specific IP
// @route  GET /api/analytics/ip/:ip
// @access Admin only
const getByIP = async (req, res) => {
    try {
        const logs = await VisitorLog.find({ ip: req.params.ip }).sort({ lastSeen: -1 }).lean();
        res.json(logs);
    } catch (error) {
        console.error("Analytics by IP error:", error);
        res.status(500).json({ message: "Failed to fetch IP analytics" });
    }
};

module.exports = { trackEvent, getSummary, getDetailed, getByIP };
