/**
 * ============================================================
 * EMAIL SERVICE TEST SCRIPT
 * Chemical Business Reports — server/test_email.js
 * ============================================================
 * Usage:
 *   node test_email.js              → runs all tests
 *   node test_email.js smtp         → SMTP connection check only
 *   node test_email.js daily        → sends daily report only
 *   node test_email.js weekly       → sends weekly report only
 *   node test_email.js recipients   → lists all resolved recipient emails
 *   node test_email.js raw          → sends a raw minimal test email
 * ============================================================
 */

require("dotenv").config();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

// ─── Helpers ─────────────────────────────────────────────────
const GREEN  = (s) => `\x1b[32m${s}\x1b[0m`;
const RED    = (s) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const CYAN   = (s) => `\x1b[36m${s}\x1b[0m`;
const BOLD   = (s) => `\x1b[1m${s}\x1b[0m`;

function pass(label, detail = "") {
    console.log(`  ${GREEN("✔ PASS")}  ${BOLD(label)}${detail ? "  →  " + CYAN(detail) : ""}`);
}
function fail(label, err) {
    console.log(`  ${RED("✘ FAIL")}  ${BOLD(label)}`);
    console.log(`           ${RED(err?.message || String(err))}`);
}
function info(msg) {
    console.log(`  ${YELLOW("ℹ")} ${msg}`);
}
function divider(title) {
    console.log(`\n${BOLD("─".repeat(60))}`);
    console.log(BOLD(`  ${title}`));
    console.log(`${"─".repeat(60)}`);
}

// ─── ENV Sanity Check ─────────────────────────────────────────
function checkEnv() {
    divider("TEST 0 — Environment Variables");

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const MONGO_URI  = process.env.MONGODB_URI;

    if (EMAIL_USER) {
        pass("EMAIL_USER is set", EMAIL_USER);
    } else {
        fail("EMAIL_USER is missing", new Error("Add EMAIL_USER to server/.env"));
    }

    if (EMAIL_PASS && EMAIL_PASS !== "your_16_char_gmail_app_password_here" && EMAIL_PASS.replace(/\s/g, "").length === 16) {
        pass("EMAIL_PASS looks like a valid Gmail App Password (16 chars)");
    } else if (!EMAIL_PASS || EMAIL_PASS === "your_16_char_gmail_app_password_here") {
        fail("EMAIL_PASS is a placeholder", new Error("Generate a Gmail App Password at https://myaccount.google.com/apppasswords"));
    } else {
        const cleaned = EMAIL_PASS.replace(/\s/g, "");
        if (cleaned.length !== 16) {
            fail(`EMAIL_PASS length is ${cleaned.length} chars (expected 16)`, new Error("Gmail App Passwords are exactly 16 characters"));
        } else {
            pass("EMAIL_PASS is set");
        }
    }

    if (MONGO_URI) {
        pass("MONGODB_URI is set");
    } else {
        fail("MONGODB_URI is missing", new Error("Required for recipient resolution and metrics"));
    }
}

// ─── Build Transporter ────────────────────────────────────────
function buildTransporter() {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: true }
    });
}

// ─── TEST 1: SMTP Connection ──────────────────────────────────
async function testSmtpConnection() {
    divider("TEST 1 — SMTP Connection (Gmail)");
    const transporter = buildTransporter();
    try {
        await transporter.verify();
        pass("SMTP connection to smtp.gmail.com:465", "SSL OK");
        pass("Auth credentials accepted by Gmail");
    } catch (err) {
        fail("SMTP connection failed", err);
        info("Common causes:");
        info("  • EMAIL_PASS is not a Gmail App Password (must be 16 chars)");
        info("  • 2-Step Verification not enabled on the Gmail account");
        info("  → Generate one at: https://myaccount.google.com/apppasswords");
        throw err; // stop further tests if SMTP fails
    }
}

// ─── TEST 2: Raw Minimal Email ─────────────────────────────────
async function testRawEmail() {
    divider("TEST 2 — Raw Test Email (No DB Required)");
    const transporter = buildTransporter();
    const to = process.env.EMAIL_USER; // send to self
    try {
        const sendResult = await transporter.sendMail({
            from: `"Email Test Script" <${process.env.EMAIL_USER}>`,
            to,
            subject: `SMTP Test — Chemical Business Reports [${new Date().toISOString()}]`,
            html: `
                <div style="font-family:sans-serif;padding:20px;background:#f4f6f8;">
                    <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <h2 style="color:#0f172a;margin-top:0;">SMTP Test Successful</h2>
                        <p style="color:#475569;">This email confirms that the <strong>Gmail SMTP transporter</strong> is correctly configured for <strong>Chemical Business Reports</strong>.</p>
                        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:20px;">
                            <tr style="background:#f1f5f9;"><td style="padding:8px 12px;font-weight:700;color:#64748b;">Sent At</td><td style="padding:8px 12px;">${new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })} WAT</td></tr>
                            <tr><td style="padding:8px 12px;font-weight:700;color:#64748b;">From</td><td style="padding:8px 12px;">${process.env.EMAIL_USER}</td></tr>
                            <tr style="background:#f1f5f9;"><td style="padding:8px 12px;font-weight:700;color:#64748b;">To</td><td style="padding:8px 12px;">${to}</td></tr>
                            <tr><td style="padding:8px 12px;font-weight:700;color:#64748b;">SMTP Host</td><td style="padding:8px 12px;">smtp.gmail.com:465 (SSL)</td></tr>
                        </table>
                        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Sent by test_email.js — Chemical Business Reports Server</p>
                    </div>
                </div>
            `
        });
        pass("Raw test email sent", `messageId: ${sendResult.messageId}`);
        info(`Email delivered to: ${to}`);
    } catch (err) {
        fail("Raw test email failed", err);
    }
}

// ─── TEST 3: Recipient Resolution ─────────────────────────────
async function testRecipientResolution() {
    divider("TEST 3 — Recipient Email Resolution (DB)");
    try {
        const { getAllRecipientEmails } = require("./services/emailReportService");
        const emails = await getAllRecipientEmails();
        if (emails && emails.length > 0) {
            pass(`Resolved ${emails.length} recipient(s)`);
            emails.forEach((e, i) => info(`  [${i + 1}] ${e}`));
        } else {
            fail("No recipients resolved", new Error("getAllRecipientEmails returned empty array"));
        }
    } catch (err) {
        fail("Recipient resolution failed", err);
    }
}

// ─── TEST 4: Daily Report Email ────────────────────────────────
async function testDailyReport() {
    divider("TEST 4 — Daily Report Email");
    try {
        info("Gathering metrics and sending daily report...");
        const { sendDailyReport } = require("./services/emailReportService");
        // Send only to self for testing (safe mode)
        const result = await sendDailyReport([process.env.EMAIL_USER]);
        if (result.success) {
            pass("Daily report email sent successfully");
            info(`Recipients: ${result.recipientsCount}`);
            info(`Message ID: ${result.messageId}`);
        } else {
            fail("Daily report returned failure", new Error(result.error));
        }
    } catch (err) {
        fail("Daily report threw an exception", err);
    }
}

// ─── TEST 5: Weekly Report Email ──────────────────────────────
async function testWeeklyReport() {
    divider("TEST 5 — Weekly Report Email");
    try {
        info("Gathering metrics and sending weekly report...");
        const { sendWeeklyReport } = require("./services/emailReportService");
        // Send only to self for testing (safe mode)
        const result = await sendWeeklyReport([process.env.EMAIL_USER]);
        if (result.success) {
            pass("Weekly report email sent successfully");
            info(`Recipients: ${result.recipientsCount}`);
            info(`Message ID: ${result.messageId}`);
        } else {
            fail("Weekly report returned failure", new Error(result.error));
        }
    } catch (err) {
        fail("Weekly report threw an exception", err);
    }
}

// ─── DB Connect + Disconnect ──────────────────────────────────
async function connectDB() {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
            info("MongoDB connected");
        }
    } catch (err) {
        fail("MongoDB connection failed", err);
        throw err;
    }
}

async function disconnectDB() {
    try {
        await mongoose.disconnect();
        info("MongoDB disconnected");
    } catch (_) { /* ignore disconnect errors */ }
}

// ─── Main Runner ──────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
    console.error(RED("\n  [Unhandled Rejection] " + (reason?.message || reason)));
});

async function main() {
    const arg = process.argv[2] || "all";

    console.log(BOLD(CYAN("\n============================================================")));
    console.log(BOLD(CYAN("   Chemical Business Reports - Email Service Test Suite")));
    console.log(BOLD(CYAN("============================================================")));
    console.log(`  Mode: ${YELLOW(arg)}   Time: ${new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })} WAT\n`);

    checkEnv();

    if (arg === "smtp") {
        try { await testSmtpConnection(); } catch (_) {}

    } else if (arg === "raw") {
        try { await testSmtpConnection(); } catch (_) { return; }
        await testRawEmail();

    } else if (arg === "recipients") {
        try { await connectDB(); } catch (_) { return; }
        await testRecipientResolution();
        await disconnectDB();

    } else if (arg === "daily") {
        try { await testSmtpConnection(); } catch (_) { return; }
        try { await connectDB(); } catch (_) { return; }
        await testDailyReport();
        await disconnectDB();

    } else if (arg === "weekly") {
        try { await testSmtpConnection(); } catch (_) { return; }
        try { await connectDB(); } catch (_) { return; }
        await testWeeklyReport();
        await disconnectDB();

    } else {
        // "all" — run all tests, continue even if one fails
        try { await testSmtpConnection(); } catch (_) {
            divider("SUMMARY");
            console.log(RED("  SMTP failed — cannot send any emails. Fix credentials first.\n"));
            return;
        }
        await testRawEmail();
        try { await connectDB(); } catch (_) {
            divider("SUMMARY");
            console.log(RED("  MongoDB connection failed — skipping DB-dependent tests.\n"));
            return;
        }
        await testRecipientResolution();
        await testDailyReport();
        await testWeeklyReport();
        await disconnectDB();
    }

    divider("SUMMARY");
    console.log(GREEN("  All selected tests completed. Check your inbox for test emails.\n"));
}

main();
