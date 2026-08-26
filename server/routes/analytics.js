const express = require("express");
const router = express.Router();
const {
    trackEvent,
    getSummary,
    getDetailed,
    getDailyVisitors,
    getByIP,
    getReportLogs,
    getReportStatus
} = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");
const { sendDailyReport, sendWeeklyReport, sendVisitorAlertEmail } = require("../services/emailReportService");

// Public tracking endpoint — visitors send events here
router.post("/track", trackEvent);

// Admin-only analytics endpoints
router.get("/summary", protect, admin, getSummary);
router.get("/detailed", protect, admin, getDetailed);
router.get("/daily-visitors", protect, admin, getDailyVisitors);
router.get("/ip/:ip", protect, admin, getByIP);
router.get("/report-logs", protect, admin, getReportLogs);
router.get("/report-status", protect, admin, getReportStatus);

// Manual Trigger endpoints (Admin protected)
router.post("/send-daily-report", protect, admin, async (req, res) => {
    try {
        const { recipients } = req.body;
        const result = await sendDailyReport(recipients);
        if (result.success) {
            res.json({ message: "Daily metrics report email sent successfully!", result });
        } else {
            res.status(500).json({ message: "Failed to send daily report email.", error: result.error });
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to send daily report", error: err.message });
    }
});

router.post("/send-weekly-report", protect, admin, async (req, res) => {
    try {
        const { recipients } = req.body;
        const result = await sendWeeklyReport(recipients);
        if (result.success) {
            res.json({ message: "Weekly metrics report email sent successfully!", result });
        } else {
            res.status(500).json({ message: "Failed to send weekly report email.", error: result.error });
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to send weekly report", error: err.message });
    }
});

// Test Real-Time Visitor Alert
router.post("/test-visitor-alert", protect, admin, async (req, res) => {
    try {
        const result = await sendVisitorAlertEmail({
            ip: req.body.ip || "197.210.226.15",
            path: req.body.path || "/admin/analytics",
            userAgent: req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            sessionId: "test_session_alert",
            country: "Nigeria",
            city: "Lagos",
            device: "Desktop"
        });
        res.json({ message: "Test visitor alert email sent successfully!", result });
    } catch (err) {
        res.status(500).json({ message: "Failed to send test visitor alert", error: err.message });
    }
});

module.exports = router;
