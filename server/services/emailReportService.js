require("dotenv").config(); // Ensure env vars are loaded even if required before dotenv.config() in index.js
const nodemailer = require("nodemailer");
const VisitorLog = require("../models/VisitorLog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const EmailReportLog = require("../models/EmailReportLog");

// In-memory debounce cache to prevent flooding notifications for the same IP/session within a short time window (10 mins)
const visitorAlertThrottle = new Map();
const VISITOR_ALERT_THROTTLE_MS = 10 * 60 * 1000; // 10 minutes

// Configure nodemailer transporter using Gmail SMTP with App Password
// IMPORTANT: EMAIL_PASS must be a 16-character Gmail App Password, NOT your regular Gmail password.
// Generate one at: https://myaccount.google.com/apppasswords (2FA must be enabled first)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER || "coslab.media@gmail.com",
        pass: process.env.EMAIL_PASS || "" // Must be a Gmail App Password, not your account password
    },
    tls: {
        rejectUnauthorized: true
    }
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email transporter verification failed:", error.message);
        console.error("   → Make sure EMAIL_PASS in .env is a valid Gmail App Password (16 chars).");
        console.error("   → Generate one at: https://myaccount.google.com/apppasswords");
    } else {
        console.log("✅ Email transporter is ready to send messages (Gmail SMTP connected).");
    }
});

/**
 * Fetch all registered user emails and submission subscriber emails (deduplicated).
 */
async function getAllRecipientEmails() {
    try {
        // Only registered active users
        const users = await User.find({ isActive: { $ne: false } }, "email");

        const emailSet = new Set();
        users.forEach(u => {
            if (u.email && u.email.trim()) emailSet.add(u.email.trim().toLowerCase());
        });

        // Always include main company email as fallback
        emailSet.add("coslab.media@gmail.com");

        return Array.from(emailSet);
    } catch (err) {
        console.error("Error fetching recipient emails:", err);
        return ["coslab.media@gmail.com"];
    }
}

/**
 * Fetch primary admin notification emails (for instant alerts).
 */
async function getAdminAlertEmails() {
    try {
        const admins = await User.find({ role: "admin", isActive: { $ne: false } }, "email");
        const emailSet = new Set();
        admins.forEach(a => {
            if (a.email && a.email.trim()) emailSet.add(a.email.trim().toLowerCase());
        });
        emailSet.add("coslab.media@gmail.com");
        return Array.from(emailSet);
    } catch (err) {
        return ["coslab.media@gmail.com"];
    }
}

/**
 * Gather content & post inventory metrics (Posts made yesterday, scheduled posts, total platform posts, category breakdowns).
 */
async function gatherPostMetrics() {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

        // 1. Posts made yesterday (createdAt between startOfYesterday and startOfToday)
        const yesterdayPostsRaw = await Post.aggregate([
            { $match: { createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const postsYesterdayCount = yesterdayPostsRaw.reduce((sum, item) => sum + item.count, 0);
        const postsYesterdayCategories = yesterdayPostsRaw.map(item => ({
            category: item._id || "Uncategorized",
            count: item.count
        }));

        // 2. Total posts on entire platform & category breakdown
        const totalPlatformPosts = await Post.countDocuments();
        const publishedPostsCount = await Post.countDocuments({
            $or: [{ status: "published" }, { status: { $exists: false } }]
        });
        const draftPostsCount = await Post.countDocuments({ status: "draft" });

        const platformCategoriesRaw = await Post.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const platformPostsCategories = platformCategoriesRaw.map(item => ({
            category: item._id || "Uncategorized",
            count: item.count
        }));

        // 3. Scheduled posts & category breakdown
        const scheduledPostsRaw = await Post.aggregate([
            { $match: { status: "scheduled" } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const scheduledPostsCount = scheduledPostsRaw.reduce((sum, item) => sum + item.count, 0);
        const scheduledPostsCategories = scheduledPostsRaw.map(item => ({
            category: item._id || "Uncategorized",
            count: item.count
        }));

        const yesterdayDateString = startOfYesterday.toLocaleDateString("en-US", { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        return {
            postsYesterdayCount,
            postsYesterdayCategories,
            totalPlatformPosts,
            publishedPostsCount,
            draftPostsCount,
            platformPostsCategories,
            scheduledPostsCount,
            scheduledPostsCategories,
            yesterdayDateString
        };
    } catch (error) {
        console.error("Error in gatherPostMetrics:", error);
        return {
            postsYesterdayCount: 0,
            postsYesterdayCategories: [],
            totalPlatformPosts: 0,
            publishedPostsCount: 0,
            draftPostsCount: 0,
            platformPostsCategories: [],
            scheduledPostsCount: 0,
            scheduledPostsCategories: [],
            yesterdayDateString: "Yesterday"
        };
    }
}

/**
 * Render HTML section for Content & Publishing Metrics (Yesterday's Posts, Scheduled Posts, Total Platform Posts, Categories).
 */
function renderPostMetricsHtml(pm) {
    if (!pm) return "";

    const yesterdayCatChips = pm.postsYesterdayCategories.length > 0
        ? pm.postsYesterdayCategories.map(c => `
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 12px; font-size: 12px; display: inline-block; margin-right: 6px; margin-bottom: 6px;">
                <strong style="color: #1e293b;">${c.category}:</strong> <span style="color: #0284c7; font-weight: 800;">${c.count}</span>
            </div>
        `).join("")
        : `<div style="font-size: 12px; color: #64748b; font-style: italic;">No posts created yesterday (${pm.yesterdayDateString}).</div>`;

    const scheduledCatChips = pm.scheduledPostsCategories.length > 0
        ? pm.scheduledPostsCategories.map(c => `
            <div style="background: #ffffff; border: 1px solid #fde68a; border-radius: 8px; padding: 6px 12px; font-size: 12px; display: inline-block; margin-right: 6px; margin-bottom: 6px;">
                <strong style="color: #78350f;">${c.category}:</strong> <span style="color: #d97706; font-weight: 800;">${c.count}</span>
            </div>
        `).join("")
        : `<div style="font-size: 12px; color: #64748b; font-style: italic;">No posts currently scheduled.</div>`;

    const platformCatRows = pm.platformPostsCategories.length > 0
        ? pm.platformPostsCategories.map(c => {
            const pct = pm.totalPlatformPosts > 0 
                ? ((c.count / pm.totalPlatformPosts) * 100).toFixed(1) 
                : "0.0";
            return `
                <tr>
                    <td><strong>${c.category}</strong></td>
                    <td style="text-align: right; font-weight: bold; color: #0f172a;">${c.count}</td>
                    <td style="text-align: right; color: #64748b; font-size: 12px;">${pct}%</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="3" style="text-align: center; color: #94a3b8;">No posts found on platform.</td></tr>`;

    return `
        <!-- Content Publishing Overview Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 14px; text-align: center;">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #0284c7;">Yesterday's Posts</div>
                <div style="font-size: 22px; font-weight: 800; color: #0369a1; margin-top: 2px;">${pm.postsYesterdayCount}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${pm.yesterdayDateString}</div>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: center;">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #16a34a;">Total Platform Posts</div>
                <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 2px;">${pm.totalPlatformPosts}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${pm.publishedPostsCount} Live • ${pm.scheduledPostsCount} Scheduled</div>
            </div>
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px; text-align: center;">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #d97706;">Scheduled Posts</div>
                <div style="font-size: 22px; font-weight: 800; color: #b45309; margin-top: 2px;">${pm.scheduledPostsCount}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Queued for publish</div>
            </div>
        </div>

        <!-- Detailed Publishing Breakdown -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                📝 Posts Made Yesterday by Category (${pm.yesterdayDateString})
            </div>
            <div style="margin-bottom: 16px;">
                ${yesterdayCatChips}
            </div>

            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                ⏰ Scheduled Posts Queue by Category
            </div>
            <div style="margin-bottom: 16px;">
                ${scheduledCatChips}
            </div>

            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">
                📚 Platform Overall Category Distribution
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 0;">
                <thead>
                    <tr>
                        <th style="background: #f1f5f9; padding: 8px 10px; text-align: left; color: #475569; font-weight: 700; border-bottom: 2px solid #e2e8f0;">Category</th>
                        <th style="background: #f1f5f9; padding: 8px 10px; text-align: right; color: #475569; font-weight: 700; border-bottom: 2px solid #e2e8f0;">Total Articles</th>
                        <th style="background: #f1f5f9; padding: 8px 10px; text-align: right; color: #475569; font-weight: 700; border-bottom: 2px solid #e2e8f0;">Share</th>
                    </tr>
                </thead>
                <tbody>
                    ${platformCatRows}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Gather daily analytics & post metrics accurately.
 */
async function gatherDailyMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let dailyVisits = 0;
    const dailyUniqueIPs = new Set();
    let weeklyVisits = 0;
    let monthlyVisits = 0;
    let dailyClicks = 0;
    let dailyInteractions = 0;
    let dailyCommentsCount = 0;
    let approvedCommentsCount = 0;
    const topPostsToday = [];

    // 1. Visitor logs
    try {
        const allLogs = await VisitorLog.find();

        allLogs.forEach(log => {
            let activeToday = false;
            if (new Date(log.lastSeen) >= startOfToday || new Date(log.firstSeen) >= startOfToday) {
                activeToday = true;
            }

            if (log.pages && log.pages.length > 0) {
                log.pages.forEach(p => {
                    const vTime = new Date(p.visitedAt);
                    if (vTime >= startOfToday) {
                        dailyVisits += 1;
                        activeToday = true;
                    }
                    if (vTime >= startOfWeek) weeklyVisits += 1;
                    if (vTime >= startOfMonth) monthlyVisits += 1;
                });
            }

            if (activeToday && log.ip) {
                dailyUniqueIPs.add(log.ip);
            }

            if (log.buttons && log.buttons.length > 0) {
                log.buttons.forEach(b => {
                    if (new Date(b.clickedAt) >= startOfToday) dailyClicks += 1;
                });
            }

            if (log.postsInteracted && log.postsInteracted.length > 0) {
                log.postsInteracted.forEach(pi => {
                    if (new Date(pi.at) >= startOfToday) {
                        dailyInteractions += 1;
                    }
                });
            }
        });
    } catch (err) {
        console.error("Error fetching VisitorLogs in gatherDailyMetrics:", err);
    }

    // 2. Comments today
    try {
        dailyCommentsCount = await Comment.countDocuments({
            createdAt: { $gte: startOfToday }
        });

        approvedCommentsCount = await Comment.countDocuments({
            isApproved: true,
            createdAt: { $gte: startOfToday }
        });
    } catch (err) {
        console.error("Error fetching Comments in gatherDailyMetrics:", err);
    }

    // 3. Top posts today
    try {
        const topPostsDB = await Post.find({
            $or: [{ status: "published" }, { status: { $exists: false } }]
        })
            .sort({ views: -1 })
            .limit(5)
            .select("title views category slug");
        
        topPostsDB.forEach(p => {
            topPostsToday.push({ title: p.title, count: p.views || 0, category: p.category });
        });
    } catch (err) {
        console.error("Error fetching top posts in gatherDailyMetrics:", err);
    }

    // 4. Gather Post & Category publishing metrics
    const postMetrics = await gatherPostMetrics();

    return {
        dateString: now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        dailyVisits,
        dailyUniqueVisitors: dailyUniqueIPs.size,
        weeklyVisits,
        monthlyVisits,
        dailyClicks,
        dailyInteractions,
        dailyCommentsCount,
        approvedCommentsCount,
        topPostsToday,
        postMetrics
    };
}

/**
 * Gather 7-day comprehensive weekly metrics (Thursday to Thursday) & post metrics safely.
 */
async function gatherWeeklyMetrics() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let weeklyVisits = 0;
    const weeklyUniqueIPs = new Set();
    let weeklyClicks = 0;
    let weeklyInteractions = 0;
    let weeklyCommentsCount = 0;
    const topWeeklyPosts = [];

    // Day-by-day stats array for past 7 days
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
        daysMap[dayKey] = { day: dayKey, visits: 0, clicks: 0, interactions: 0 };
    }

    try {
        const allLogs = await VisitorLog.find();

        allLogs.forEach(log => {
            let activeWeekly = false;
            if (new Date(log.lastSeen) >= sevenDaysAgo || new Date(log.firstSeen) >= sevenDaysAgo) {
                activeWeekly = true;
            }

            if (log.pages && log.pages.length > 0) {
                log.pages.forEach(p => {
                    const vTime = new Date(p.visitedAt);
                    if (vTime >= sevenDaysAgo) {
                        weeklyVisits += 1;
                        activeWeekly = true;
                        const dayKey = vTime.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
                        if (daysMap[dayKey]) daysMap[dayKey].visits += 1;
                    }
                });
            }

            if (activeWeekly && log.ip) {
                weeklyUniqueIPs.add(log.ip);
            }

            if (log.buttons && log.buttons.length > 0) {
                log.buttons.forEach(b => {
                    const cTime = new Date(b.clickedAt);
                    if (cTime >= sevenDaysAgo) {
                        weeklyClicks += 1;
                        const dayKey = cTime.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
                        if (daysMap[dayKey]) daysMap[dayKey].clicks += 1;
                    }
                });
            }

            if (log.postsInteracted && log.postsInteracted.length > 0) {
                log.postsInteracted.forEach(pi => {
                    const iTime = new Date(pi.at);
                    if (iTime >= sevenDaysAgo) {
                        weeklyInteractions += 1;
                        const dayKey = iTime.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
                        if (daysMap[dayKey]) daysMap[dayKey].interactions += 1;
                    }
                });
            }
        });
    } catch (err) {
        console.error("Error fetching VisitorLogs in gatherWeeklyMetrics:", err);
    }

    try {
        weeklyCommentsCount = await Comment.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
    } catch (err) {
        console.error("Error fetching Comments in gatherWeeklyMetrics:", err);
    }

    try {
        const posts = await Post.find({
            $or: [{ status: "published" }, { status: { $exists: false } }]
        })
            .sort({ views: -1 })
            .limit(5)
            .select("title views category slug");
        posts.forEach(p => topWeeklyPosts.push(p));
    } catch (err) {
        console.error("Error fetching top posts in gatherWeeklyMetrics:", err);
    }

    // Gather Post & Category publishing metrics
    const postMetrics = await gatherPostMetrics();

    return {
        startDate: sevenDaysAgo.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
        endDate: now.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
        weeklyVisits,
        weeklyUniqueVisitors: weeklyUniqueIPs.size,
        weeklyClicks,
        weeklyInteractions,
        weeklyCommentsCount,
        dailyBreakdown: Object.values(daysMap),
        topWeeklyPosts,
        postMetrics
    };
}

/**
 * Send Daily Website Metrics Email Report.
 */
async function sendDailyReport(customRecipients = null) {
    const todayKey = new Date().toISOString().split("T")[0];
    try {
        const recipients = customRecipients || await getAllRecipientEmails();
        const m = await gatherDailyMetrics();

        const postMetricsHtml = renderPostMetricsHtml(m.postMetrics);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
                    .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #38bdf8; }
                    .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }
                    .content { padding: 30px; }
                    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
                    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center; }
                    .card-val { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
                    .card-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
                    .table-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
                    th { background: #f1f5f9; padding: 10px 12px; text-align: left; color: #475569; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
                    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Chemical Business Reports</h1>
                        <p>📊 Daily Executive Summary & Content Metrics • ${m.dateString}</p>
                    </div>
                    <div class="content">
                        <!-- Content & Publishing Metrics Section -->
                        ${postMetricsHtml}

                        <!-- Visitor Traffic & Interaction Metrics -->
                        <div class="table-title">📈 Visitor & Site Engagement</div>
                        <div class="grid">
                            <div class="card">
                                <div class="card-lbl">Today's Visits</div>
                                <div class="card-val" style="color: #0284c7;">${m.dailyVisits}</div>
                            </div>
                            <div class="card">
                                <div class="card-lbl">Unique Visitors</div>
                                <div class="card-val" style="color: #0d9488;">${m.dailyUniqueVisitors}</div>
                            </div>
                            <div class="card">
                                <div class="card-lbl">Weekly Total</div>
                                <div class="card-val" style="color: #6366f1;">${m.weeklyVisits}</div>
                            </div>
                            <div class="card">
                                <div class="card-lbl">Monthly Total</div>
                                <div class="card-val" style="color: #8b5cf6;">${m.monthlyVisits}</div>
                            </div>
                        </div>

                        <div class="grid">
                            <div class="card">
                                <div class="card-lbl">Total Button Clicks</div>
                                <div class="card-val">${m.dailyClicks}</div>
                            </div>
                            <div class="card">
                                <div class="card-lbl">Comments / Reviews</div>
                                <div class="card-val">${m.dailyCommentsCount}</div>
                            </div>
                        </div>

                        <div class="table-title">🔥 Top Performing Articles Today</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Article Title</th>
                                    <th style="text-align: right;">Views / Interactions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${m.topPostsToday.length > 0 ? m.topPostsToday.map(p => `
                                    <tr>
                                        <td><strong>${p.title}</strong></td>
                                        <td style="text-align: right; font-weight: bold; color: #0284c7;">${p.count}</td>
                                    </tr>
                                `).join("") : `
                                    <tr>
                                        <td colspan="2" style="text-align: center; color: #94a3b8;">No specific post interactions logged today.</td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Chemical Business Reports. All rights reserved.</p>
                        <p>Sent automatically via coslab.media@gmail.com every day at 6:00 AM WAT.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send individual email to each recipient
        const results = await Promise.allSettled(
            recipients.map(email =>
                transporter.sendMail({
                    from: '"Chemical Business Reports" <coslab.media@gmail.com>',
                    to: email,
                    subject: `📊 Daily Website & Content Metrics Report - ${m.dateString}`,
                    html: htmlContent
                })
            )
        );

        const succeeded = results.filter(r => r.status === "fulfilled");
        const failed    = results.filter(r => r.status === "rejected");

        succeeded.forEach((r) => {
            console.log(`Daily report sent to recipient — ${r.value.messageId}`);
        });
        failed.forEach((r) => {
            console.error(`Daily report FAILED for a recipient:`, r.reason?.message);
        });

        const lastId = succeeded.length > 0 ? succeeded[succeeded.length - 1].value.messageId : null;
        console.log(`Daily report: ${succeeded.length}/${recipients.length} delivered successfully.`);

        // Record in DB for persistent tracking
        await EmailReportLog.create({
            reportType: "daily",
            dateKey: todayKey,
            recipients,
            recipientsCount: succeeded.length,
            success: succeeded.length > 0,
            messageId: lastId || "",
            error: failed.length > 0 ? failed.map(f => f.reason?.message).join("; ") : "",
            metadata: {
                dailyVisits: m.dailyVisits,
                dailyUniqueVisitors: m.dailyUniqueVisitors,
                postsYesterday: m.postMetrics?.postsYesterdayCount || 0
            }
        });

        return { success: succeeded.length > 0, recipientsCount: succeeded.length, failedCount: failed.length, messageId: lastId };
    } catch (error) {
        console.error("Failed to send daily report email:", error);
        await EmailReportLog.create({
            reportType: "daily",
            dateKey: todayKey,
            success: false,
            error: error.message
        }).catch(() => {});
        return { success: false, error: error.message };
    }
}

/**
 * Send Weekly Thursday Comprehensive Email Report.
 */
async function sendWeeklyReport(customRecipients = null) {
    const now = new Date();
    const weekKey = `${now.getFullYear()}-W${Math.ceil((((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1) / 7)}`;
    try {
        const recipients = customRecipients || await getAllRecipientEmails();
        const w = await gatherWeeklyMetrics();

        const postMetricsHtml = renderPostMetricsHtml(w.postMetrics);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
                    .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 35px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                    .header p { margin: 6px 0 0 0; font-size: 13px; color: #e0f2fe; }
                    .content { padding: 30px; }
                    .summary-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; }
                    .sum-val { font-size: 22px; font-weight: 800; color: #0369a1; }
                    .sum-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #0284c7; }
                    .table-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 25px 0 12px 0; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
                    th { background: #f1f5f9; padding: 10px 12px; text-align: left; color: #475569; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
                    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Chemical Business Reports</h1>
                        <p>📈 Comprehensive Weekly Performance & Content Report (${w.startDate} - ${w.endDate})</p>
                    </div>
                    <div class="content">
                        <!-- Content & Publishing Metrics Section -->
                        ${postMetricsHtml}

                        <!-- Weekly Traffic Summary Box -->
                        <div class="table-title" style="margin-top: 10px;">📊 Weekly Traffic & Engagement Overview</div>
                        <div class="summary-box">
                            <div class="summary-grid">
                                <div>
                                    <div class="sum-lbl">7-Day Total Visits</div>
                                    <div class="sum-val">${w.weeklyVisits}</div>
                                </div>
                                <div>
                                    <div class="sum-lbl">Unique Visitors</div>
                                    <div class="sum-val">${w.weeklyUniqueVisitors}</div>
                                </div>
                                <div>
                                    <div class="sum-lbl">Total Button Clicks</div>
                                    <div class="sum-val">${w.weeklyClicks}</div>
                                </div>
                            </div>
                        </div>

                        <div class="table-title">📅 Day-by-Day Traffic Breakdown</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th style="text-align: center;">Visits</th>
                                    <th style="text-align: center;">Button Clicks</th>
                                    <th style="text-align: right;">Post Interactions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${w.dailyBreakdown.map(d => `
                                    <tr>
                                        <td><strong>${d.day}</strong></td>
                                        <td style="text-align: center; font-weight: bold; color: #0284c7;">${d.visits}</td>
                                        <td style="text-align: center;">${d.clicks}</td>
                                        <td style="text-align: right; color: #0d9488;">${d.interactions}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>

                        <div class="table-title">🏆 Top Published Articles This Week</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Article Title</th>
                                    <th>Category</th>
                                    <th style="text-align: right;">Total Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${w.topWeeklyPosts.map(p => `
                                    <tr>
                                        <td><strong>${p.title}</strong></td>
                                        <td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${p.category}</span></td>
                                        <td style="text-align: right; font-weight: bold; color: #0284c7;">${p.views || 0}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Chemical Business Reports. All rights reserved.</p>
                        <p>Sent automatically via coslab.media@gmail.com every Thursday at 8:00 AM WAT.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send individual email to each recipient
        const results = await Promise.allSettled(
            recipients.map(email =>
                transporter.sendMail({
                    from: '"Chemical Business Reports" <coslab.media@gmail.com>',
                    to: email,
                    subject: `📈 Weekly Comprehensive Performance & Content Report (${w.startDate} - ${w.endDate})`,
                    html: htmlContent
                })
            )
        );

        const succeeded = results.filter(r => r.status === "fulfilled");
        const failed    = results.filter(r => r.status === "rejected");

        succeeded.forEach((r) => {
            console.log(`Weekly report sent to recipient — ${r.value.messageId}`);
        });
        failed.forEach((r) => {
            console.error(`Weekly report FAILED for a recipient:`, r.reason?.message);
        });

        const lastId = succeeded.length > 0 ? succeeded[succeeded.length - 1].value.messageId : null;
        console.log(`Weekly report: ${succeeded.length}/${recipients.length} delivered successfully.`);

        // Record in DB for persistent tracking
        await EmailReportLog.create({
            reportType: "weekly",
            dateKey: weekKey,
            recipients,
            recipientsCount: succeeded.length,
            success: succeeded.length > 0,
            messageId: lastId || "",
            error: failed.length > 0 ? failed.map(f => f.reason?.message).join("; ") : "",
            metadata: {
                weeklyVisits: w.weeklyVisits,
                weeklyUniqueVisitors: w.weeklyUniqueVisitors,
                weeklyClicks: w.weeklyClicks
            }
        });

        return { success: succeeded.length > 0, recipientsCount: succeeded.length, failedCount: failed.length, messageId: lastId };
    } catch (error) {
        console.error("Failed to send weekly report email:", error);
        await EmailReportLog.create({
            reportType: "weekly",
            dateKey: weekKey,
            success: false,
            error: error.message
        }).catch(() => {});
        return { success: false, error: error.message };
    }
}

/**
 * Send Instant Real-Time Visitor IP Arrival Alert.
 * Uses smart throttling per IP / session (10 mins) so email inbox stays pristine while capturing every visitor.
 */
async function sendVisitorAlertEmail({ ip, path, userAgent, sessionId, country, city, device }) {
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
        // Still allow alert if needed, but throttle
    }

    const throttleKey = `${ip}_${sessionId || "default"}`;
    const lastSent = visitorAlertThrottle.get(throttleKey);
    const now = Date.now();

    if (lastSent && (now - lastSent) < VISITOR_ALERT_THROTTLE_MS) {
        // Throttled: alert was already sent for this visitor session recently
        return { throttled: true };
    }

    visitorAlertThrottle.set(throttleKey, now);

    // Prune old cache entries if map grows large
    if (visitorAlertThrottle.size > 1000) {
        for (const [k, ts] of visitorAlertThrottle.entries()) {
            if (now - ts > VISITOR_ALERT_THROTTLE_MS) visitorAlertThrottle.delete(k);
        }
    }

    try {
        const alertRecipients = await getAdminAlertEmails();
        const watTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos", dateStyle: "full", timeStyle: "medium" });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
                    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .hdr { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 24px; text-align: center; color: #ffffff; }
                    .hdr h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
                    .hdr p { margin: 4px 0 0 0; font-size: 12px; color: #e0f2fe; }
                    .body { padding: 24px; }
                    .tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; text-transform: uppercase; background: #e0f2fe; color: #0369a1; margin-bottom: 15px; }
                    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                    .lbl { color: #64748b; font-weight: 600; }
                    .val { font-weight: 700; color: #0f172a; font-family: monospace; }
                    .cta { display: block; text-align: center; background: #0284c7; color: #ffffff !important; padding: 12px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-top: 20px; font-size: 13px; }
                    .ftr { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="hdr">
                        <h2>⚡ New Visitor IP Arrival Alert</h2>
                        <p>Chemical Business Reports Real-Time Traffic Tracker</p>
                    </div>
                    <div class="body">
                        <div class="tag">Live Visitor Detected</div>
                        <div class="row">
                            <span class="lbl">Visitor IP Address:</span>
                            <span class="val" style="color: #0284c7; font-size: 15px;">${ip}</span>
                        </div>
                        <div class="row">
                            <span class="lbl">Visited Page:</span>
                            <span class="val" style="font-family: inherit; color: #0f172a;">${path || "/"}</span>
                        </div>
                        <div class="row">
                            <span class="lbl">Arrival Time (WAT):</span>
                            <span class="val" style="font-family: inherit;">${watTime}</span>
                        </div>
                        ${country ? `
                        <div class="row">
                            <span class="lbl">Location:</span>
                            <span class="val" style="font-family: inherit;">${city ? city + ", " : ""}${country}</span>
                        </div>` : ""}
                        ${device ? `
                        <div class="row">
                            <span class="lbl">Device Type:</span>
                            <span class="val" style="font-family: inherit;">${device}</span>
                        </div>` : ""}
                        <div class="row" style="border-bottom: none;">
                            <span class="lbl">User Agent:</span>
                            <span class="val" style="font-size: 11px; word-break: break-all; font-family: inherit; color: #64748b;">${userAgent ? userAgent.slice(0, 100) + "..." : "Browser"}</span>
                        </div>

                        <a href="https://chemicalbusinessreports.com/admin/analytics" class="cta">
                            📊 View Visitor in Admin Detailed Report
                        </a>
                    </div>
                    <div class="ftr">
                        Sent automatically by Chemical Business Reports Platform • Instant Visitor Security & Traffic Monitor
                    </div>
                </div>
            </body>
            </html>
        `;

        await Promise.allSettled(
            alertRecipients.map(email =>
                transporter.sendMail({
                    from: '"CBR Traffic Alert" <coslab.media@gmail.com>',
                    to: email,
                    subject: `⚡ New Visitor Arrival: ${ip} on ${path || "/"}`,
                    html
                })
            )
        );

        return { success: true };
    } catch (err) {
        console.error("Error sending visitor alert email:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Send Instant Notification for New Comment.
 */
async function sendNewCommentNotification({ authorName, content, postTitle, postId }) {
    try {
        const recipients = await getAdminAlertEmails();
        const html = `
            <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 24px;">
                <h3 style="color: #0f172a; margin-top: 0;">💬 New Comment Submitted for Moderation</h3>
                <p><strong>Article:</strong> ${postTitle || "Chemical Business Report"}</p>
                <p><strong>Author:</strong> ${authorName || "Anonymous"}</p>
                <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 15px 0; font-style: italic; color: #334155;">
                    "${content}"
                </div>
                <a href="https://chemicalbusinessreports.com/admin" style="display: inline-block; background: #0284c7; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Review & Approve in Admin</a>
            </div>
        `;
        await Promise.allSettled(
            recipients.map(email =>
                transporter.sendMail({
                    from: '"CBR Notifications" <coslab.media@gmail.com>',
                    to: email,
                    subject: `💬 New Comment from ${authorName || "User"} on "${postTitle ? postTitle.slice(0, 35) + "..." : "Article"}"`,
                    html
                })
            )
        );
    } catch (e) {
        console.error("Error sending comment alert:", e);
    }
}

/**
 * Send Instant Notification for New Subscription/Submission.
 */
async function sendNewSubmissionNotification({ name, email, company }) {
    try {
        const recipients = await getAdminAlertEmails();
        const html = `
            <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 24px;">
                <h3 style="color: #0f172a; margin-top: 0;">📬 New Newsletter / Platform Subscriber</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr><td style="padding: 6px 0; color: #64748b; font-weight: bold;">Name:</td><td>${name || "—"}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b; font-weight: bold;">Email:</td><td><strong>${email}</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b; font-weight: bold;">Company:</td><td>${company || "—"}</td></tr>
                </table>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Chemical Business Reports Subscriber Notification</p>
            </div>
        `;
        await Promise.allSettled(
            recipients.map(to =>
                transporter.sendMail({
                    from: '"CBR Notifications" <coslab.media@gmail.com>',
                    to,
                    subject: `📬 New Subscription: ${email} (${company || name || "Subscriber"})`,
                    html
                })
            )
        );
    } catch (e) {
        console.error("Error sending submission alert:", e);
    }
}

/**
 * Send Instant Notification for New Executive Profile Submission.
 */
async function sendNewExecutiveProfileNotification({ fullName, company, email, position }) {
    try {
        const recipients = await getAdminAlertEmails();
        const html = `
            <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 24px;">
                <h3 style="color: #0f172a; margin-top: 0;">👤 New Executive Profile Submitted</h3>
                <p><strong>Full Name:</strong> ${fullName}</p>
                <p><strong>Position / Role:</strong> ${position || "Executive"}</p>
                <p><strong>Company:</strong> ${company || "—"}</p>
                <p><strong>Email:</strong> ${email || "—"}</p>
                <a href="https://chemicalbusinessreports.com/admin" style="display: inline-block; background: #0284c7; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 15px;">View in Admin Dashboard</a>
            </div>
        `;
        await Promise.allSettled(
            recipients.map(to =>
                transporter.sendMail({
                    from: '"CBR Notifications" <coslab.media@gmail.com>',
                    to,
                    subject: `👤 New Executive Profile: ${fullName} (${company || "Executive"})`,
                    html
                })
            )
        );
    } catch (e) {
        console.error("Error sending executive profile alert:", e);
    }
}

/**
 * Fetch past report execution logs for Admin Dashboard.
 */
async function getRecentReportLogs(limit = 20) {
    try {
        return await EmailReportLog.find().sort({ sentAt: -1 }).limit(limit).lean();
    } catch (err) {
        console.error("Error fetching report logs:", err);
        return [];
    }
}

module.exports = {
    sendDailyReport,
    sendWeeklyReport,
    sendVisitorAlertEmail,
    sendNewCommentNotification,
    sendNewSubmissionNotification,
    sendNewExecutiveProfileNotification,
    getRecentReportLogs,
    gatherDailyMetrics,
    gatherWeeklyMetrics,
    gatherPostMetrics,
    getAllRecipientEmails,
    getAdminAlertEmails
};
