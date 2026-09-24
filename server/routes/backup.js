const express = require("express");
const router = express.Router();
const { runBackupJob } = require("../services/backupService");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// POST /api/backup/run — manually trigger backup (admin only)
router.post("/run", authenticate, authorize("admin"), async (req, res) => {
    try {
        console.log("[Backup API] Manual backup triggered by admin:", req.user?.username);
        const result = await runBackupJob();
        if (result.success) {
            return res.json({
                success: true,
                message: "Backup completed and email sent.",
                timestamp: result.timestamp,
                totalDocs: result.totalDocs,
                zipSizeKB: result.zipSizeKB,
                collections: result.collectionStats?.length,
            });
        }
        return res.status(500).json({ success: false, message: result.error || "Backup failed" });
    } catch (err) {
        console.error("[Backup API] Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
