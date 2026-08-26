require("dotenv").config();
const mongoose = require("mongoose");
const VisitorLog = require("./models/VisitorLog");
const EmailReportLog = require("./models/EmailReportLog");
const { sendVisitorAlertEmail, sendNewCommentNotification } = require("./services/emailReportService");
const { getSchedulerStatus } = require("./services/reportSchedulerService");

async function runAnalyticsVerification() {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected.");

    console.log("\n1. Testing Scheduler Status:");
    const status = await getSchedulerStatus();
    console.log("Scheduler Status:", JSON.stringify(status, null, 2));

    console.log("\n2. Testing EmailReportLog Query:");
    const logs = await EmailReportLog.find().sort({ sentAt: -1 }).limit(5).lean();
    console.log(`Found ${logs.length} EmailReportLog entries. Latest:`, logs[0] ? {
        reportType: logs[0].reportType,
        dateKey: logs[0].dateKey,
        success: logs[0].success,
        recipientsCount: logs[0].recipientsCount,
        sentAt: logs[0].sentAt
    } : "None");

    console.log("\n3. Testing Visitor Alert Email Dispatch:");
    const alertResult = await sendVisitorAlertEmail({
        ip: "105.112.180.45",
        path: "/category/chemical-mart",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        sessionId: "test_verification_session",
        country: "Nigeria",
        city: "Lagos",
        device: "Mobile"
    });
    console.log("Visitor Alert Email Result:", alertResult);

    console.log("\n4. Testing Daily Visitor Aggregation:");
    const dailyBreakdown = await VisitorLog.aggregate([
        {
            $project: {
                ip: 1,
                totalVisits: 1,
                totalTimeSpentSeconds: 1,
                device: 1,
                country: 1,
                pages: 1,
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
                uniqueIPsList: { $addToSet: "$ip" }
            }
        },
        {
            $project: {
                day: "$_id",
                totalSessions: 1,
                totalVisits: 1,
                uniqueIPsCount: { $size: "$uniqueIPsList" }
            }
        },
        { $sort: { day: -1 } },
        { $limit: 5 }
    ]);
    console.log("Daily Aggregation Result:", dailyBreakdown);

    await mongoose.disconnect();
    console.log("\n✅ All analytics and notification checks completed successfully.");
}

runAnalyticsVerification().catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
});
