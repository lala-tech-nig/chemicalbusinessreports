const nodemailer = require("nodemailer");
const VisitorLog = require("../models/VisitorLog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Submission = require("../models/Submission");

// Configure nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "coslab.media@gmail.com",
        pass: process.env.EMAIL_PASS || "" // Set EMAIL_PASS in server/.env
    }
});

/**
 * Fetch all registered user emails and submission subscriber emails (deduplicated).
 */
async function getAllRecipientEmails() {
    try {
        const users = await User.find({ isActive: { $ne: false } }, "email");
        const submissions = await Submission.find({}, "email");

        const emailSet = new Set();
        users.forEach(u => {
            if (u.email && u.email.trim()) emailSet.add(u.email.trim().toLowerCase());
        });
        submissions.forEach(s => {
            if (s.email && s.email.trim()) emailSet.add(s.email.trim().toLowerCase());
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
        const publishedPostsCount = await Post.countDocuments({ status: "published" });
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
 * Gather daily analytics & post metrics safely.
 */
async function gatherDailyMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let dailyVisits = 0;
    let dailyUniqueVisitors = 0;
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
            if (new Date(log.lastSeen) >= startOfToday) {
                dailyUniqueVisitors += 1;
            }

            if (log.pages && log.pages.length > 0) {
                log.pages.forEach(p => {
                    const vTime = new Date(p.visitedAt);
                    if (vTime >= startOfToday) dailyVisits += 1;
                    if (vTime >= startOfWeek) weeklyVisits += 1;
                    if (vTime >= startOfMonth) monthlyVisits += 1;
                });
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
        const topPostsDB = await Post.find({ isPublished: true })
            .sort({ views: -1 })
            .limit(5)
            .select("title views category");
        
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
        dailyUniqueVisitors,
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
    let weeklyUniqueVisitors = 0;
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
            if (new Date(log.lastSeen) >= sevenDaysAgo) {
                weeklyUniqueVisitors += 1;
            }

            if (log.pages && log.pages.length > 0) {
                log.pages.forEach(p => {
                    const vTime = new Date(p.visitedAt);
                    if (vTime >= sevenDaysAgo) {
                        weeklyVisits += 1;
                        const dayKey = vTime.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
                        if (daysMap[dayKey]) daysMap[dayKey].visits += 1;
                    }
                });
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
        const posts = await Post.find({ isPublished: true })
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
        weeklyUniqueVisitors,
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

        const mailOptions = {
            from: '"Chemical Business Reports" <coslab.media@gmail.com>',
            to: recipients.join(", "),
            subject: `📊 Daily Website & Content Metrics Report - ${m.dateString}`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Daily report email sent successfully:", info.messageId);
        return { success: true, recipientsCount: recipients.length, messageId: info.messageId };
    } catch (error) {
        console.error("Failed to send daily report email:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send Weekly Thursday Comprehensive Email Report.
 */
async function sendWeeklyReport(customRecipients = null) {
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

        const mailOptions = {
            from: '"Chemical Business Reports" <coslab.media@gmail.com>',
            to: recipients.join(", "),
            subject: `📈 Weekly Comprehensive Performance & Content Report (${w.startDate} - ${w.endDate})`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Weekly report email sent successfully:", info.messageId);
        return { success: true, recipientsCount: recipients.length, messageId: info.messageId };
    } catch (error) {
        console.error("Failed to send weekly report email:", error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendDailyReport,
    sendWeeklyReport,
    gatherDailyMetrics,
    gatherWeeklyMetrics,
    gatherPostMetrics,
    getAllRecipientEmails
};
