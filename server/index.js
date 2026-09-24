const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();

// Connect to Database
connectDB();

// Start post scheduler background service
const { startScheduler } = require("./services/postSchedulerService");
startScheduler();

// Start automated email report scheduler (Daily 6am WAT & Weekly Thursday 8am WAT)
const { startReportScheduler } = require("./services/reportSchedulerService");
startReportScheduler();

// Start nightly database backup scheduler (00:00 Nigeria Time)
const { startBackupScheduler } = require("./services/backupService");
startBackupScheduler();

const app = express();

// Middleware
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());

const path = require("path");

// Make uploads folder static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Make backup folder available for download (backup email links)
const backupDir = path.join(__dirname, "backup");
if (!require("fs").existsSync(backupDir)) require("fs").mkdirSync(backupDir, { recursive: true });
app.use("/backup", express.static(backupDir));

// Routes
app.use("/api/posts", require("./routes/posts"));
app.use("/api/ads", require("./routes/ads"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/users", require("./routes/users"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/executive-profiles", require("./routes/executiveProfiles"));
app.use("/api/scraper", require("./routes/scraper"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/community", require("./routes/community"));
app.use("/api/staff-tasks", require("./routes/staffTasks"));
app.use("/api/petty-cash", require("./routes/pettyCash"));
app.use("/api/finances", require("./routes/finances"));
app.use("/api/meetings", require("./routes/meetings"));
app.use("/api/backup", require("./routes/backup"));
app.use("/api/youtube", require("./routes/youtube"));

// Health Check
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ── HTTP + Socket.io Server ──────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

// Track connected users per meeting room
const meetingRooms = {};

io.on("connection", (socket) => {
    // Staff joins meeting room
    socket.on("join-meeting", ({ roomName, userId, username }) => {
        socket.join(roomName);
        if (!meetingRooms[roomName]) meetingRooms[roomName] = {};
        meetingRooms[roomName][socket.id] = { userId, username };

        // Notify others in room
        socket.to(roomName).emit("user-joined", { socketId: socket.id, userId, username });

        // Send current participants list to new joiner
        socket.emit("room-participants", Object.values(meetingRooms[roomName]));

        console.log(`[Meeting] ${username} joined room: ${roomName}`);
    });

    // Admin starts meeting
    socket.on("meeting-started", ({ roomName }) => {
        io.to(roomName).emit("meeting-started", { roomName });
        console.log(`[Meeting] Started: ${roomName}`);
    });

    // Admin ends meeting
    socket.on("meeting-ended", ({ roomName }) => {
        io.to(roomName).emit("meeting-ended", { roomName });
        delete meetingRooms[roomName];
        console.log(`[Meeting] Ended: ${roomName}`);
    });

    // Chat message inside meeting
    socket.on("meeting-message", ({ roomName, message, username, userId }) => {
        io.to(roomName).emit("meeting-message", { message, username, userId, time: new Date().toISOString() });
    });

    socket.on("disconnect", () => {
        // Clean up from all rooms
        for (const room of Object.keys(meetingRooms)) {
            if (meetingRooms[room][socket.id]) {
                const user = meetingRooms[room][socket.id];
                delete meetingRooms[room][socket.id];
                socket.to(room).emit("user-left", { socketId: socket.id, ...user });
            }
        }
    });
});

// ── Meeting auto-scheduler: every Monday at 9am WAT auto-schedule Thursday meeting ──
const cron = require("node-cron");
const { autoScheduleThursdayMeeting } = require("./controllers/meetingController");

// Every Monday at 9:00 WAT (8:00 UTC) — auto-schedule the Thursday meeting
cron.schedule("0 8 * * 1", async () => {
    console.log("[Cron] Auto-scheduling Thursday meeting...");
    await autoScheduleThursdayMeeting();
});

// Wednesday at 10:00 WAT (9:00 UTC) — send 1-day reminder to all staff
cron.schedule("0 9 * * 3", async () => {
    console.log("[Cron] Sending Thursday meeting reminder to all staff...");
    try {
        const Meeting = require("./models/Meeting");
        // Find Thursday's meeting (scheduled tomorrow)
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const dayStart = new Date(tomorrow);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(tomorrow);
        dayEnd.setUTCHours(23, 59, 59, 999);

        const meeting = await Meeting.findOne({
            scheduledAt: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ["scheduled", "active"] },
            reminderSent: false,
        });

        if (meeting) {
            meeting.reminderSent = true;
            await meeting.save();
            // Broadcast reminder via socket to all connected clients
            io.emit("meeting-reminder", {
                meetingId: meeting._id,
                title: meeting.title,
                scheduledAt: meeting.scheduledAt,
                jitsiRoomUrl: meeting.jitsiRoomUrl,
                message: "📅 Reminder: Weekly Staff Meeting is tomorrow at 11:00 AM Nigeria Time!",
            });
            console.log(`[Cron] Reminder sent for meeting: ${meeting.roomName}`);
        }
    } catch (err) {
        console.error("[Cron] Meeting reminder error:", err);
    }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Please stop the existing process and restart.`);
        process.exit(1);
    } else {
        throw err;
    }
});
