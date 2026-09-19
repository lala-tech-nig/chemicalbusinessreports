const Meeting = require("../models/Meeting");
const User = require("../models/User");

// Helper: Nigeria time (WAT = UTC+1)
const getNigeriaTime = () => {
    const now = new Date();
    // WAT offset +1hr
    return new Date(now.getTime() + 60 * 60 * 1000);
};

const buildRoomName = (date) => {
    const d = new Date(date);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `CBR-Staff-Meeting-${y}-${m}-${day}`;
};

// @desc   Create / schedule a meeting (admin only)
// @route  POST /api/meetings
exports.createMeeting = async (req, res) => {
    try {
        const { title, scheduledAt, agenda } = req.body;

        if (!scheduledAt) {
            return res.status(400).json({ message: "scheduledAt is required" });
        }

        const date = new Date(scheduledAt);
        const roomName = buildRoomName(date);
        const endAt = new Date(date.getTime() + 60 * 60 * 1000); // +1 hour

        // Prevent duplicate for same week/date
        const existing = await Meeting.findOne({ roomName });
        if (existing) {
            return res.status(409).json({ message: "A meeting is already scheduled for this date.", meeting: existing });
        }

        const jitsiRoomUrl = `https://meet.jit.si/${roomName}`;

        const meeting = await Meeting.create({
            title: title || "Weekly Staff Meeting",
            roomName,
            jitsiRoomUrl,
            scheduledAt: date,
            endAt,
            createdBy: req.user._id,
            agenda: agenda || "",
        });

        const populated = await Meeting.findById(meeting._id).populate("createdBy", "username fullName profilePhoto");
        res.status(201).json(populated);
    } catch (error) {
        console.error("createMeeting error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get all meetings (most recent first)
// @route  GET /api/meetings
exports.getMeetings = async (req, res) => {
    try {
        const { status, limit = 20 } = req.query;
        const query = {};
        if (status && status !== "all") query.status = status;

        const meetings = await Meeting.find(query)
            .populate("createdBy", "username fullName profilePhoto")
            .sort({ scheduledAt: -1 })
            .limit(Number(limit));

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get single meeting
// @route  GET /api/meetings/:id
exports.getMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id).populate("createdBy", "username fullName profilePhoto");
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get the next upcoming / currently active meeting
// @route  GET /api/meetings/next
exports.getNextMeeting = async (req, res) => {
    try {
        const now = new Date();
        const meeting = await Meeting.findOne({
            status: { $in: ["scheduled", "active"] },
            scheduledAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }, // allow 1h grace
        })
            .sort({ scheduledAt: 1 })
            .populate("createdBy", "username fullName");

        res.json(meeting || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update meeting status / notes / agenda
// @route  PUT /api/meetings/:id
exports.updateMeeting = async (req, res) => {
    try {
        const { status, notes, agenda, recordingUrl } = req.body;
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });

        if (status) meeting.status = status;
        if (notes !== undefined) meeting.notes = notes;
        if (agenda !== undefined) meeting.agenda = agenda;
        if (recordingUrl !== undefined) meeting.recordingUrl = recordingUrl;

        await meeting.save();
        const updated = await Meeting.findById(meeting._id).populate("createdBy", "username fullName profilePhoto");
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Delete a meeting
// @route  DELETE /api/meetings/:id
exports.deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findByIdAndDelete(req.params.id);
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });
        res.json({ message: "Meeting deleted", id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Auto-schedule next Thursday meeting (called by cron)
exports.autoScheduleThursdayMeeting = async () => {
    try {
        const now = new Date();
        // Find next Thursday
        const dayOfWeek = now.getUTCDay(); // 0=Sun, 4=Thu
        const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
        const nextThursday = new Date(now);
        nextThursday.setUTCDate(now.getUTCDate() + daysUntilThursday);
        // 11:00 WAT = 10:00 UTC
        nextThursday.setUTCHours(10, 0, 0, 0);

        const roomName = buildRoomName(nextThursday);
        const existing = await Meeting.findOne({ roomName });
        if (existing) return; // already scheduled

        const jitsiRoomUrl = `https://meet.jit.si/${roomName}`;
        await Meeting.create({
            title: "Weekly Staff Meeting",
            roomName,
            jitsiRoomUrl,
            scheduledAt: nextThursday,
            endAt: new Date(nextThursday.getTime() + 60 * 60 * 1000),
            agenda: "Weekly performance review and team sync.",
        });
        console.log(`[Meeting] Auto-scheduled Thursday meeting: ${roomName}`);
    } catch (err) {
        console.error("[Meeting] Auto-schedule error:", err);
    }
};
