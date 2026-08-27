const VisitorLog = require("../models/VisitorLog");
const EmailReportLog = require("../models/EmailReportLog");
const Post = require("../models/Post");
const Ad = require("../models/Ad");
const {
    sendVisitorAlertEmail,
    sendAdClickClientNotification,
    sendArticleReadClientNotification
} = require("../services/emailReportService");
const { getSchedulerStatus } = require("../services/reportSchedulerService");

/**
 * Helper: Parse basic device and browser info from user agent.
 */
function parseUserAgent(ua = "") {
    let device = "Desktop";
    let browser = "Other";
    let os = "Other";

    if (/mobile/i.test(ua)) device = "Mobile";
    else if (/tablet|ipad/i.test(ua)) device = "Tablet";

    if (/chrome|crios/i.test(ua) && !/edg|opr/i.test(ua)) browser = "Chrome";
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/edg/i.test(ua)) browser = "Edge";
    else if (/opr|opera/i.test(ua)) browser = "Opera";

    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/linux/i.test(ua)) os = "Linux";

    return { device, browser, os };
}

/**
 * Helper: Build date query based on dateRange or startDate/endDate.
 */
function buildDateFilter(dateRange, startDate, endDate) {
    const now = new Date();
    let filter = {};

    if (dateRange === "today") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        filter.lastSeen = { $gte: start };
    } else if (dateRange === "yesterday") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        filter.lastSeen = { $gte: start, $lt: end };
    } else if (dateRange === "7days") {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filter.lastSeen = { $gte: start };
    } else if (dateRange === "30days") {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filter.lastSeen = { $gte: start };
    } else if (dateRange === "thisMonth") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        filter.lastSeen = { $gte: start };
    } else if (startDate || endDate) {
        filter.lastSeen = {};
        if (startDate) filter.lastSeen.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.lastSeen.$lte = end;
        }
    }

    return filter;
}

// @desc   Track a visitor event (page visit, button click, post interaction, time spent)
// @route  POST /api/analytics/track
// @access Public
const trackEvent = async (req, res) => {
    try {
        const { sessionId, userAgent, event } = req.body;

        // Extract client IP reliably from request headers or body
        const rawIp = req.body.ip || 
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || 
            req.headers["cf-connecting-ip"] || 
            req.socket?.remoteAddress || 
            req.ip || 
            "unknown";

        const cleanIp = rawIp.replace(/^::ffff:/, ""); // strip IPv6 prefix for cleaner display
        const activeSessionId = sessionId || `session_${Math.random().toString(36).slice(2)}_${Date.now()}`;
        const ua = userAgent || req.headers["user-agent"] || "";
        const { device, browser, os } = parseUserAgent(ua);
        const country = req.headers["cf-ipcountry"] || req.body.country || "Unknown";

        if (!event || !event.type) {
            return res.status(400).json({ message: "Event type is required" });
        }

        // Find existing log for this IP + sessionId or create new
        let log = await VisitorLog.findOne({ ip: cleanIp, sessionId: activeSessionId });
        const isNewSession = !log;

        if (!log) {
            log = new VisitorLog({
                ip: cleanIp,
                sessionId: activeSessionId,
                userAgent: ua,
                device,
                browser,
                os,
                country,
                firstSeen: new Date(),
                lastSeen: new Date(),
                totalVisits: 1
            });
        } else {
            log.lastSeen = new Date();
            if (device) log.device = device;
            if (browser) log.browser = browser;
            if (os) log.os = os;
            if (country && country !== "Unknown") log.country = country;
        }

        // Process event types
        switch (event.type) {
            case "page_visit":
                log.pages.push({
                    path: event.payload?.path || "/",
                    visitedAt: new Date()
                });
                if (log.pages.length > 1) {
                    log.totalVisits = log.pages.length;
                }
                break;

            case "button_click":
                log.buttons.push({
                    label: event.payload?.label || "Unknown",
                    path: event.payload?.path || "/",
                    clickedAt: new Date()
                });
                break;

            case "ad_click":
                log.buttons.push({
                    label: `Ad Click: ${event.payload?.adTitle || event.payload?.adId || "Advertisement"}`,
                    path: event.payload?.path || "/",
                    clickedAt: new Date()
                });

                // Increment ad click counter & dispatch client notification
                (async () => {
                    try {
                        let targetAd = null;
                        if (event.payload?.adId) {
                            targetAd = await Ad.findById(event.payload.adId);
                        } else if (event.payload?.adTitle) {
                            targetAd = await Ad.findOne({ title: event.payload.adTitle, isActive: true });
                        }

                        if (targetAd) {
                            targetAd.totalClicks = (targetAd.totalClicks || 0) + 1;
                            await targetAd.save();

                            if (targetAd.clientEmail) {
                                sendAdClickClientNotification({
                                    adTitle: targetAd.title,
                                    clientEmail: targetAd.clientEmail,
                                    clientName: targetAd.clientName,
                                    path: event.payload?.path || "/",
                                    ip: cleanIp,
                                    device: log.device,
                                    sessionId: activeSessionId
                                }).catch(e => console.error("Ad click client alert error:", e));
                            }
                        }
                    } catch (adErr) {
                        console.error("Error processing ad_click event:", adErr);
                    }
                })();
                break;

            case "post_interaction":
                log.postsInteracted.push({
                    postSlug: event.payload?.postSlug || "",
                    postTitle: event.payload?.postTitle || "",
                    action: event.payload?.action || "view",
                    at: new Date()
                });

                // If this is an article view for Corporate Profile or Executive Brief with a client email, notify the client
                if ((event.payload?.action === "view" || !event.payload?.action) && event.payload?.postSlug) {
                    (async () => {
                        try {
                            const post = await Post.findOne({ slug: event.payload.postSlug }, "title category email companyName");
                            if (post && post.email && (post.category === "Corporate Profile" || post.category === "Executive Brief" || post.category === "Chemical Mart")) {
                                sendArticleReadClientNotification({
                                    postTitle: post.title,
                                    category: post.category,
                                    clientEmail: post.email,
                                    companyName: post.companyName,
                                    path: `/posts/${event.payload.postSlug}`,
                                    ip: cleanIp,
                                    device: log.device,
                                    sessionId: activeSessionId
                                }).catch(pErr => console.error("Article read client alert error:", pErr));
                            }
                        } catch (pErr) {
                            console.error("Error checking post for readership alert:", pErr);
                        }
                    })();
                }
                break;

            case "time_spent":
                log.totalTimeSpentSeconds += parseInt(event.payload?.seconds, 10) || 0;
                break;

            case "session_end":
                log.totalTimeSpentSeconds += parseInt(event.payload?.seconds, 10) || 0;
                break;

            default:
                break;
        }

        await log.save();

        // Trigger Real-Time Visitor Arrival Alert in Background (debounced & async)
        if (event.type === "page_visit") {
            // Fire & forget async email alert so response is instant
            sendVisitorAlertEmail({
                ip: cleanIp,
                path: event.payload?.path || "/",
                userAgent: ua,
                sessionId: activeSessionId,
                country: log.country,
                device: log.device
            }).catch(err => console.error("Visitor alert background err:", err));
        }

        res.status(200).json({ success: true, ip: cleanIp, sessionId: activeSessionId });
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
        const { dateRange, startDate, endDate } = req.query;
        const dateMatch = buildDateFilter(dateRange, startDate, endDate);

        const totalUniqueSessions = await VisitorLog.countDocuments(dateMatch);
        const uniqueIPs = await VisitorLog.distinct("ip", dateMatch);
        const totalUniqueIPs = uniqueIPs.length;

        // Total visits across matching logs
        const totalVisitsResult = await VisitorLog.aggregate([
            { $match: dateMatch },
            { $group: { _id: null, total: { $sum: "$totalVisits" } } }
        ]);
        const totalVisits = totalVisitsResult[0]?.total || 0;

        // Average time spent in seconds
        const avgTimeResult = await VisitorLog.aggregate([
            { $match: dateMatch },
            { $group: { _id: null, avg: { $avg: "$totalTimeSpentSeconds" } } }
        ]);
        const avgTimeSeconds = Math.round(avgTimeResult[0]?.avg || 0);

        // Top pages
        const topPages = await VisitorLog.aggregate([
            { $match: dateMatch },
            { $unwind: "$pages" },
            { $group: { _id: "$pages.path", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top buttons
        const topButtons = await VisitorLog.aggregate([
            { $match: dateMatch },
            { $unwind: "$buttons" },
            { $group: { _id: "$buttons.label", path: { $first: "$buttons.path" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top posts interacted
        const topPosts = await VisitorLog.aggregate([
            { $match: dateMatch },
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
            { $match: dateMatch },
            {
                $group: {
                    _id: "$ip",
                    sessions: { $sum: 1 },
                    totalVisits: { $sum: "$totalVisits" },
                    totalTime: { $sum: "$totalTimeSpentSeconds" },
                    device: { $first: "$device" },
                    country: { $first: "$country" },
                    firstSeen: { $min: "$firstSeen" },
                    lastSeen: { $max: "$lastSeen" }
                }
            },
            { $sort: { totalVisits: -1 } },
            { $limit: 15 }
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

// @desc   Get detailed visitor logs with full filters and pagination
// @route  GET /api/analytics/detailed
// @access Admin only
const getDetailed = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const { dateRange, startDate, endDate, ip, search, pagePath, sortBy, sortOrder } = req.query;

        // Build query filter
        const query = buildDateFilter(dateRange, startDate, endDate);

        if (ip) {
            query.ip = { $regex: ip.trim(), $options: "i" };
        }

        if (search) {
            const cleanSearch = search.trim();
            query.$or = [
                { ip: { $regex: cleanSearch, $options: "i" } },
                { userAgent: { $regex: cleanSearch, $options: "i" } },
                { country: { $regex: cleanSearch, $options: "i" } },
                { "pages.path": { $regex: cleanSearch, $options: "i" } }
            ];
        }

        if (pagePath) {
            query["pages.path"] = { $regex: pagePath.trim(), $options: "i" };
        }

        // Sorting
        let sortObj = { lastSeen: -1 };
        const order = sortOrder === "asc" ? 1 : -1;

        if (sortBy === "firstSeen") sortObj = { firstSeen: order };
        else if (sortBy === "totalVisits") sortObj = { totalVisits: order };
        else if (sortBy === "timeSpent") sortObj = { totalTimeSpentSeconds: order };
        else if (sortBy === "pagesCount") sortObj = { "pages.length": order };
        else if (sortBy === "lastSeen") sortObj = { lastSeen: order };

        const total = await VisitorLog.countDocuments(query);
        const logs = await VisitorLog.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
            logs
        });
    } catch (error) {
        console.error("Analytics detailed error:", error);
        res.status(500).json({ message: "Failed to fetch detailed analytics" });
    }
};

// @desc   Get Daily Visitors breakdown (Day by Day summary & IP lists)
// @route  GET /api/analytics/daily-visitors
// @access Admin only
const getDailyVisitors = async (req, res) => {
    try {
        const days = parseInt(req.query.days, 10) || 14;
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Aggregate by day string (YYYY-MM-DD)
        const dailyAgg = await VisitorLog.aggregate([
            {
                $match: {
                    lastSeen: { $gte: startDate }
                }
            },
            {
                $project: {
                    ip: 1,
                    sessionId: 1,
                    totalVisits: 1,
                    totalTimeSpentSeconds: 1,
                    device: 1,
                    country: 1,
                    pages: 1,
                    buttons: 1,
                    lastSeen: 1,
                    day: {
                        $dateToString: { format: "%Y-%m-%d", date: "$lastSeen", timezone: "Africa/Lagos" }
                    }
                }
            },
            {
                $group: {
                    _id: "$day",
                    totalSessions: { $sum: 1 },
                    totalVisits: { $sum: "$totalVisits" },
                    uniqueIPsList: { $addToSet: "$ip" },
                    totalTimeSeconds: { $sum: "$totalTimeSpentSeconds" },
                    logs: {
                        $push: {
                            ip: "$ip",
                            sessionId: "$sessionId",
                            totalVisits: "$totalVisits",
                            totalTimeSpentSeconds: "$totalTimeSpentSeconds",
                            device: "$device",
                            country: "$country",
                            pagesCount: { $size: { $ifNull: ["$pages", []] } },
                            buttonsCount: { $size: { $ifNull: ["$buttons", []] } },
                            lastSeen: "$lastSeen"
                        }
                    }
                }
            },
            {
                $project: {
                    day: "$_id",
                    totalSessions: 1,
                    totalVisits: 1,
                    uniqueIPsCount: { $size: "$uniqueIPsList" },
                    uniqueIPsList: 1,
                    avgTimeSeconds: {
                        $cond: [{ $gt: ["$totalSessions", 0] }, { $round: [{ $divide: ["$totalTimeSeconds", "$totalSessions"] }, 0] }, 0]
                    },
                    logs: 1
                }
            },
            { $sort: { day: -1 } }
        ]);

        res.json({
            daysCount: dailyAgg.length,
            dailyBreakdown: dailyAgg
        });
    } catch (error) {
        console.error("Daily visitors aggregation error:", error);
        res.status(500).json({ message: "Failed to fetch daily visitors breakdown" });
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

// @desc   Get Email Report Execution Logs
// @route  GET /api/analytics/report-logs
// @access Admin only
const getReportLogs = async (req, res) => {
    try {
        const logs = await EmailReportLog.find().sort({ sentAt: -1 }).limit(30).lean();
        res.json(logs);
    } catch (error) {
        console.error("Report logs error:", error);
        res.status(500).json({ message: "Failed to fetch report logs" });
    }
};

// @desc   Get Report Scheduler Health & Status
// @route  GET /api/analytics/report-status
// @access Admin only
const getReportStatus = async (req, res) => {
    try {
        const status = await getSchedulerStatus();
        res.json(status);
    } catch (error) {
        console.error("Report status error:", error);
        res.status(500).json({ message: "Failed to fetch report status" });
    }
};

module.exports = {
    trackEvent,
    getSummary,
    getDetailed,
    getDailyVisitors,
    getByIP,
    getReportLogs,
    getReportStatus
};
