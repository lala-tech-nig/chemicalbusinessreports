const cron = require("node-cron");
const { sendDailyReport, sendWeeklyReport } = require("./emailReportService");

function startReportScheduler() {
    console.log("Initializing Automated Email Metrics Report Scheduler...");

    // 1. Daily Report at 6:00 AM Nigeria Time (WAT / Africa/Lagos)
    cron.schedule(
        "0 6 * * *",
        async () => {
            console.log("⏰ Running Daily Metrics Report Cron (6:00 AM WAT)...");
            const result = await sendDailyReport();
            console.log("Daily report result:", result);
        },
        {
            scheduled: true,
            timezone: "Africa/Lagos"
        }
    );

    // 2. Weekly Comprehensive Report every Thursday at 8:00 AM Nigeria Time (WAT / Africa/Lagos)
    cron.schedule(
        "0 8 * * 4",
        async () => {
            console.log("⏰ Running Weekly Thursday Metrics Report Cron (8:00 AM WAT)...");
            const result = await sendWeeklyReport();
            console.log("Weekly report result:", result);
        },
        {
            scheduled: true,
            timezone: "Africa/Lagos"
        }
    );

    console.log("✅ Report Scheduler active: Daily reports at 6:00 AM WAT, Weekly Thursday reports at 8:00 AM WAT.");
}

module.exports = { startReportScheduler };
