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
 * Gather daily analytics metrics.
 */
async function gatherDailyMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Visitor logs
    const allLogs = await VisitorLog.find();
    
    let dailyVisits = 0;
    let dailyUniqueVisitors = 0;
    let weeklyVisits = 0;
    let monthlyVisits = 0;
    let dailyClicks = 0;
    let dailyInteractions = 0;

    const postViewCounts = {};

    allLogs.forEach(log => {
        // Daily visits
        if (new Date(log.lastSeen) >= startOfToday) {
            dailyUniqueVisitors += 1;
        }

        // Page visits breakdown
        if (log.pages && log.pages.length > 0) {
            log.pages.forEach(p => {
                const vTime = new Date(p.visitedAt);
                if (vTime >= startOfToday) dailyVisits += 1;
                if (vTime >= startOfWeek) weeklyVisits += 1;
                if (vTime >= startOfMonth) monthlyVisits += 1;
            });
        }

        // Button clicks
        if (log.buttons && log.buttons.length > 0) {
            log.buttons.forEach(b => {
                if (new Date(b.clickedAt) >= startOfToday) dailyClicks += 1;
            });
        }

        // Post interactions
        if (log.postsInteracted && log.postsInteracted.length > 0) {
            log.postsInteracted.forEach(pi => {
                if (new Date(pi.at) >= startOfToday) {
                    dailyInteractions += 1;
                    if (pi.postTitle) {
                        postViewCounts[pi.postTitle] = (postViewCounts[pi.postTitle] || 0) + 1;
                    }
                }
            });
        }
    });

    // 2. Comments today
    const dailyCommentsCount = await Comment.countDocuments({
        createdAt: { $gte: startOfToday }
    });

    const approvedCommentsCount = await Comment.countDocuments({
        isApproved: true,
        createdAt: { $gte: startOfToday }
    });

    // Sort top 5 performing posts today
    const topPostsToday = Object.entries(postViewCounts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // If no specific post interactions logged today, fetch top published posts
    if (topPostsToday.length === 0) {
        const topPostsDB = await Post.find({ isPublished: true })
            .sort({ views: -1 })
            .limit(5)
            .select("title views category");
        
        topPostsDB.forEach(p => {
            topPostsToday.push({ title: p.title, count: p.views || 0, category: p.category });
        });
    }

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
        topPostsToday
    };
}

/**
 * Gather 7-day comprehensive weekly metrics (Thursday to Thursday).
 */
async function gatherWeeklyMetrics() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allLogs = await VisitorLog.find();

    let weeklyVisits = 0;
    let weeklyUniqueVisitors = 0;
    let weeklyClicks = 0;
    let weeklyInteractions = 0;

    // Day-by-day stats array for past 7 days
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
        daysMap[dayKey] = { day: dayKey, visits: 0, clicks: 0, interactions: 0 };
    }

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

    const weeklyCommentsCount = await Comment.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });

    const topWeeklyPosts = await Post.find({ isPublished: true })
        .sort({ views: -1 })
        .limit(5)
        .select("title views category slug");

    return {
        startDate: sevenDaysAgo.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
        endDate: now.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
        weeklyVisits,
        weeklyUniqueVisitors,
        weeklyClicks,
        weeklyInteractions,
        weeklyCommentsCount,
        dailyBreakdown: Object.values(daysMap),
        topWeeklyPosts
    };
}

/**
 * Send Daily Website Metrics Email Report.
 */
async function sendDailyReport(customRecipients = null) {
    try {
        const recipients = customRecipients || await getAllRecipientEmails();
        const m = await gatherDailyMetrics();

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
                    .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #38bdf8; }
                    .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }
                    .content { padding: 30px; }
                    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
                    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center; }
                    .card-val { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
                    .card-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; tracking-wider; }
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
                        <p>📊 Daily Analytics Executive Summary • ${m.dateString}</p>
                    </div>
                    <div class="content">
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
            subject: `📊 Daily Website Metrics Report - ${m.dateString}`,
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
                        <p>📈 Comprehensive Weekly Performance Report (${w.startDate} - ${w.endDate})</p>
                    </div>
                    <div class="content">
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
            subject: `📈 Weekly Comprehensive Metrics Report (${w.startDate} - ${w.endDate})`,
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
    getAllRecipientEmails
};
