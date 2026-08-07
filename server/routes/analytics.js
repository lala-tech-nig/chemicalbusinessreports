const express = require("express");
const router = express.Router();
const { trackEvent, getSummary, getDetailed, getByIP } = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

const { sendDailyReport, sendWeeklyReport } = require("../services/emailReportService");

// Public endpoint — anyone visiting the site sends events here
router.post("/track", trackEvent);

// Admin-only endpoints
router.get("/summary", protect, admin, getSummary);
router.get("/detailed", protect, admin, getDetailed);
router.get("/ip/:ip", protect, admin, getByIP);

// Manual Report Trigger endpoints (Admin protected)
router.post("/send-daily-report", protect, admin, async (req, res) => {
    const { recipients } = req.body;
    const result = await sendDailyReport(recipients);
    if (result.success) {
        res.json({ message: "Daily metrics report email sent successfully!", result });
    } else {
        res.status(500).json({ message: "Failed to send daily report email.", error: result.error });
    }
});

router.post("/send-weekly-report", protect, admin, async (req, res) => {
    const { recipients } = req.body;
    const result = await sendWeeklyReport(recipients);
    if (result.success) {
        res.json({ message: "Weekly metrics report email sent successfully!", result });
    } else {
        res.status(500).json({ message: "Failed to send weekly report email.", error: result.error });
    }
});

module.exports = router;
