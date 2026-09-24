/**
 * Automated Database Backup Service
 * - Runs daily at exactly 00:00 Nigeria Time (Africa/Lagos, WAT = UTC+1)
 * - Exports all MongoDB collections to JSON files
 * - Zips them into a timestamped archive in the /backup folder
 * - Emails a success notification with a one-click download link
 */

const cron = require("node-cron");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const archiver = require("archiver");

const BACKUP_DIR = path.join(__dirname, "../backup");

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Build Gmail transporter using the same App Password pattern as emailReportService
 */
function buildTransporter() {
    const rawPass = process.env.EMAIL_PASS || "";
    const emailPass = rawPass.replace(/^["']|["']$/g, "").replace(/\s+/g, "");
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER || "coslab.media@gmail.com",
            pass: emailPass,
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
    });
}

/**
 * Export all collections to JSON files, zip them, return zip path + stats.
 */
async function runBackup() {
    const timestamp = new Date()
        .toLocaleString("sv-SE", { timeZone: "Africa/Lagos" })
        .replace(/[: ]/g, "-");
    const folderName = `backup_${timestamp}`;
    const tempDir = path.join(BACKUP_DIR, folderName);
    const zipPath = path.join(BACKUP_DIR, `${folderName}.zip`);

    // Create temp folder
    fs.mkdirSync(tempDir, { recursive: true });

    const db = mongoose.connection.db;
    const collectionNames = (await db.listCollections().toArray()).map(c => c.name);
    let totalDocs = 0;
    const collectionStats = [];

    // Export each collection
    for (const colName of collectionNames) {
        try {
            const docs = await db.collection(colName).find({}).toArray();
            const filePath = path.join(tempDir, `${colName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), "utf8");
            totalDocs += docs.length;
            collectionStats.push({ name: colName, count: docs.length });
            console.log(`[Backup] Exported ${colName}: ${docs.length} documents`);
        } catch (err) {
            console.error(`[Backup] Failed to export ${colName}:`, err.message);
            collectionStats.push({ name: colName, count: 0, error: err.message });
        }
    }

    // Zip the temp folder
    await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        output.on("close", resolve);
        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(tempDir, false);
        archive.finalize();
    });

    // Cleanup temp folder after zipping
    fs.rmSync(tempDir, { recursive: true, force: true });

    const zipSizeKB = Math.round(fs.statSync(zipPath).size / 1024);

    console.log(`[Backup] ✅ Backup complete: ${zipPath} (${zipSizeKB} KB, ${totalDocs} total docs)`);
    return { zipPath, folderName, timestamp, collectionStats, totalDocs, zipSizeKB };
}

/**
 * Prune old backups - keep only the last 30 days
 */
function pruneOldBackups() {
    try {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const files = fs.readdirSync(BACKUP_DIR);
        files.forEach(f => {
            const full = path.join(BACKUP_DIR, f);
            const stat = fs.statSync(full);
            if (stat.mtimeMs < cutoff) {
                fs.rmSync(full, { recursive: true, force: true });
                console.log(`[Backup] Pruned old file: ${f}`);
            }
        });
    } catch (err) {
        console.error("[Backup] Prune error:", err.message);
    }
}

/**
 * Send success email with download link
 */
async function sendBackupEmail({ folderName, timestamp, collectionStats, totalDocs, zipSizeKB }) {
    const emailUser = process.env.EMAIL_USER || "coslab.media@gmail.com";
    const adminEmail = process.env.ADMIN_EMAIL || emailUser;

    // Public download URL — served via the /backup static route added in index.js
    const backendBase =
        process.env.BACKEND_URL ||
        "https://chemical.livingvinepropertiesinvestment.com";
    const downloadUrl = `${backendBase}/backup/${folderName}.zip`;

    const statsRows = collectionStats
        .map(
            c =>
                `<tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:8px 16px;font-weight:500">${c.name}</td>
                    <td style="padding:8px 16px;text-align:right">${c.error ? `<span style="color:#e53e3e">Error: ${c.error}</span>` : c.count.toLocaleString()}</td>
                </tr>`
        )
        .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family:Inter,sans-serif;background:#f7f8fa;margin:0;padding:24px">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
            <div style="background:linear-gradient(135deg,#1d4ed8,#1e40af);padding:32px 40px">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800">✅ Database Backup Successful</h1>
                <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px">Chemical Business Reports — Automated Nightly Backup</p>
            </div>
            <div style="padding:32px 40px">
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px">
                    <p style="margin:0;font-size:14px;color:#166534;font-weight:600">
                        Backup completed at <strong>${timestamp} (Nigeria Time)</strong>
                    </p>
                    <p style="margin:6px 0 0;font-size:13px;color:#166534">
                        ${collectionStats.length} collections · ${totalDocs.toLocaleString()} total documents · ${zipSizeKB} KB
                    </p>
                </div>

                <h2 style="font-size:16px;font-weight:700;color:#1e293b;margin:0 0 12px">Collection Summary</h2>
                <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;margin-bottom:24px">
                    <thead>
                        <tr style="background:#f1f5f9">
                            <th style="padding:10px 16px;text-align:left;font-weight:700">Collection</th>
                            <th style="padding:10px 16px;text-align:right;font-weight:700">Documents</th>
                        </tr>
                    </thead>
                    <tbody>${statsRows}</tbody>
                </table>

                <a href="${downloadUrl}"
                   style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:100px;text-decoration:none;margin-bottom:24px">
                    ⬇ Download Backup (.zip)
                </a>

                <p style="font-size:12px;color:#94a3b8;margin:0">
                    This backup is stored securely on the server for 30 days.<br/>
                    If the button doesn't work, copy this URL: <code>${downloadUrl}</code>
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const transporter = buildTransporter();
    await transporter.sendMail({
        from: `"CBR Backup Service" <${emailUser}>`,
        to: adminEmail,
        subject: `✅ Database Backup — ${timestamp} (Nigeria Time)`,
        html,
    });

    console.log(`[Backup] 📧 Backup email sent to ${adminEmail}`);
}

/**
 * Main job: backup + email
 */
async function runBackupJob() {
    console.log("[Backup] 🗄️  Starting nightly database backup...");
    try {
        const result = await runBackup();
        pruneOldBackups();
        await sendBackupEmail(result);
        console.log("[Backup] ✅ Nightly backup job complete.");
        return { success: true, ...result };
    } catch (err) {
        console.error("[Backup] ❌ Backup job failed:", err);

        // Send failure alert
        try {
            const transporter = buildTransporter();
            await transporter.sendMail({
                from: `"CBR Backup Service" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: `❌ Database Backup FAILED — ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`,
                text: `The nightly database backup failed.\n\nError: ${err.message}\n\nStack:\n${err.stack}`,
            });
        } catch (mailErr) {
            console.error("[Backup] Could not send failure email:", mailErr.message);
        }

        return { success: false, error: err.message };
    }
}

/**
 * Schedule and expose the backup service
 */
function startBackupScheduler() {
    console.log("[Backup] Initializing nightly backup scheduler (00:00 Africa/Lagos)...");

    // Every day at midnight Nigerian time
    cron.schedule(
        "0 0 * * *",
        async () => {
            console.log("[Backup] ⏰ Midnight cron triggered — running backup...");
            await runBackupJob();
        },
        {
            scheduled: true,
            timezone: "Africa/Lagos",
        }
    );

    console.log("[Backup] ✅ Nightly backup scheduled: 00:00 Africa/Lagos (WAT).");
}

module.exports = { startBackupScheduler, runBackupJob };
