const cron = require("node-cron");
const { sendDailyReport, sendWeeklyReport } = require("./emailReportService");
const EmailReportLog = require("../models/EmailReportLog");

/**
 * Get current time details in Africa/Lagos (WAT, UTC+1).
 */
function getWatTime() {
    const now = new Date();
    // Convert to Africa/Lagos time components
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        weekday: "short"
    });
    const parts = formatter.formatToParts(now);
    const map = {};
    parts.forEach(p => { map[p.type] = p.value; });

    const dateKey = `${map.year}-${map.month}-${map.day}`;
    const hour = parseInt(map.hour, 10);
    const minute = parseInt(map.minute, 10);
    const weekday = map.weekday; // 'Thu', 'Fri', etc.

    // Week key for Thursdays
    const weekKey = `${map.year}-W${Math.ceil((((now - new Date(parseInt(map.year, 10), 0, 1)) / 86400000) + 1) / 7)}`;

    return { now, dateKey, hour, minute, weekday, weekKey };
}

/**
 * Self-healing check to ensure no daily or Thursday report is ever missed if the server
 * was sleeping, rebooting, or temporarily offline at the exact cron minute.
 */
async function checkAndSendMissedReports() {
    try {
        const { dateKey, hour, weekday, weekKey } = getWatTime();

        // 1. Check Daily Report: If current time is 6:00 AM WAT or later today,
        // and no successful daily report exists for today, send it!
        if (hour >= 6) {
            const todayReport = await EmailReportLog.findOne({
                reportType: "daily",
                dateKey: dateKey,
                success: true
            });

            if (!todayReport) {
                console.log(`⏰ [Self-Healing Scheduler] Today's daily report (${dateKey}) not yet sent. Dispatching now...`);
                const result = await sendDailyReport();
                console.log("Daily report auto-recovery result:", result);
            }
        }

        // 2. Check Weekly Thursday Report: If today is Thursday and current time is 8:00 AM WAT or later,
        // and no successful weekly report exists for this week, send it!
        if (weekday === "Thu" && hour >= 8) {
            const thisWeekReport = await EmailReportLog.findOne({
                reportType: "weekly",
                dateKey: weekKey,
                success: true
            });

            if (!thisWeekReport) {
                console.log(`⏰ [Self-Healing Scheduler] Thursday weekly report (${weekKey}) not yet sent. Dispatching now...`);
                const result = await sendWeeklyReport();
                console.log("Weekly report auto-recovery result:", result);
            }
        }
    } catch (err) {
        console.error("Error during report scheduler self-healing check:", err);
    }
}

/**
 * Start the automated crons and self-healing heartbeat.
 */
function startReportScheduler() {
    console.log("Initializing Automated Email Metrics Report Scheduler (Constant & Self-Healing)...");

    // 1. Daily Report at 6:00 AM Nigeria Time (WAT / Africa/Lagos)
    cron.schedule(
        "0 6 * * *",
        async () => {
            console.log("⏰ Running Scheduled Daily Metrics Report Cron (6:00 AM WAT)...");
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
            console.log("⏰ Running Scheduled Weekly Thursday Metrics Report Cron (8:00 AM WAT)...");
            const result = await sendWeeklyReport();
            console.log("Weekly report result:", result);
        },
        {
            scheduled: true,
            timezone: "Africa/Lagos"
        }
    );

    // 3. Self-healing heartbeat: Runs every 15 minutes to recover any missed reports
    cron.schedule(
        "*/15 * * * *",
        async () => {
            await checkAndSendMissedReports();
        },
        {
            scheduled: true,
            timezone: "Africa/Lagos"
        }
    );

    // Also run a soft check 30 seconds after server startup
    setTimeout(() => {
        checkAndSendMissedReports();
    }, 30000);

    console.log("✅ Report Scheduler active: Daily at 6:00 AM WAT, Weekly Thursdays at 8:00 AM WAT, 15-min self-healing monitor.");
}

/**
 * Get current scheduler status and last sent reports for Admin dashboard.
 */
async function getSchedulerStatus() {
    const { dateKey, hour, minute, weekday, weekKey } = getWatTime();
    const lastDaily = await EmailReportLog.findOne({ reportType: "daily" }).sort({ sentAt: -1 }).lean();
    const lastWeekly = await EmailReportLog.findOne({ reportType: "weekly" }).sort({ sentAt: -1 }).lean();

    return {
        currentTimeWAT: `${weekday} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} (${dateKey})`,
        dailySchedule: "Every day at 6:00 AM WAT (Africa/Lagos)",
        weeklySchedule: "Every Thursday at 8:00 AM WAT (Africa/Lagos)",
        selfHealingEnabled: true,
        lastDailyReport: lastDaily ? {
            sentAt: lastDaily.sentAt,
            dateKey: lastDaily.dateKey,
            success: lastDaily.success,
            recipientsCount: lastDaily.recipientsCount,
            error: lastDaily.error
        } : null,
        lastWeeklyReport: lastWeekly ? {
            sentAt: lastWeekly.sentAt,
            dateKey: lastWeekly.dateKey,
            success: lastWeekly.success,
            recipientsCount: lastWeekly.recipientsCount,
            error: lastWeekly.error
        } : null
    };
}

module.exports = {
    startReportScheduler,
    checkAndSendMissedReports,
    getSchedulerStatus
};
