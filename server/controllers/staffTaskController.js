const StaffTask = require("../models/StaffTask");
const User = require("../models/User");

// Helper to get today's date in YYYY-MM-DD
const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
};

// @desc    Get staff tasks (with privacy & draft rules)
// @route   GET /api/staff-tasks
// @access  Private (All authenticated staff/admin)
exports.getStaffTasks = async (req, res) => {
    try {
        const { date, staffId, status, isDraft, priority, search } = req.query;
        const currentUserId = req.user._id;
        const isAdmin = req.user.role === "admin";

        const query = {};

        // Date filter
        if (date && date !== "all") {
            query.date = date;
        }

        // Specific staff filter
        if (staffId) {
            query.user = staffId;
        }

        // Status filter
        if (status && status !== "all") {
            query.status = status;
        }

        // Priority filter
        if (priority && priority !== "all") {
            query.priority = priority;
        }

        // Search in title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Visibility & Drafts Access Control:
        // - Admin sees everything matching query.
        // - Non-admin:
        //    (user == currentUserId) OR (isPrivate == false AND isDraft == false AND status != 'draft')
        if (!isAdmin) {
            const visibilityClause = {
                $or: [
                    { user: currentUserId },
                    {
                        user: { $ne: currentUserId },
                        isPrivate: { $ne: true },
                        isDraft: { $ne: true },
                        status: { $ne: "draft" },
                    },
                ],
            };

            if (query.$or) {
                query.$and = [{ $or: query.$or }, visibilityClause];
                delete query.$or;
            } else {
                query.$or = visibilityClause.$or;
            }
        }

        // Explicit draft filter requested by user
        if (isDraft !== undefined) {
            query.isDraft = isDraft === "true";
        }

        const tasks = await StaffTask.find(query)
            .populate("user", "username fullName profilePhoto role department jobTitle")
            .populate({
                path: "referencedTasks",
                select: "title status date user",
                populate: { path: "user", select: "username fullName profilePhoto" },
            })
            .populate("comments.user", "username fullName profilePhoto")
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching staff tasks:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new staff task or draft
// @route   POST /api/staff-tasks
// @access  Private
exports.createStaffTask = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            status,
            isDraft,
            isPrivate,
            priority,
            referencedTasks,
            adminSupportNote,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Task title is required" });
        }

        const taskDate = date || getTodayStr();
        const draftFlag = Boolean(isDraft || status === "draft");
        const taskStatus = draftFlag ? "draft" : status || "todo";

        const task = await StaffTask.create({
            user: req.user._id,
            title: title.trim(),
            description: description || "",
            date: taskDate,
            status: taskStatus,
            isDraft: draftFlag,
            isPrivate: Boolean(isPrivate),
            priority: priority || "medium",
            referencedTasks: referencedTasks || [],
            adminSupportNote: adminSupportNote || "",
            completedAt: taskStatus === "completed" ? new Date() : null,
        });

        const populatedTask = await StaffTask.findById(task._id)
            .populate("user", "username fullName profilePhoto role department jobTitle")
            .populate({
                path: "referencedTasks",
                select: "title status date user",
                populate: { path: "user", select: "username fullName profilePhoto" },
            });

        res.status(201).json(populatedTask);
    } catch (error) {
        console.error("Error creating staff task:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status (Kanban move)
// @route   PUT /api/staff-tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminSupportNote } = req.body;

        const validStatuses = ["draft", "todo", "in_progress", "admin_support_needed", "completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const task = await StaffTask.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Verify permission: owner or admin
        const isOwner = task.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        task.status = status;
        if (status === "draft") {
            task.isDraft = true;
        } else {
            task.isDraft = false;
        }

        if (status === "completed") {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }

        if (adminSupportNote !== undefined) {
            task.adminSupportNote = adminSupportNote;
        }

        await task.save();

        const updatedTask = await StaffTask.findById(task._id)
            .populate("user", "username fullName profilePhoto role department jobTitle")
            .populate({
                path: "referencedTasks",
                select: "title status date user",
                populate: { path: "user", select: "username fullName profilePhoto" },
            })
            .populate("comments.user", "username fullName profilePhoto");

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Publish a draft task to active Kanban board
// @route   PUT /api/staff-tasks/:id/publish
// @access  Private
exports.publishDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await StaffTask.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const isOwner = task.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.isDraft = false;
        task.status = "todo";
        task.date = req.body.date || getTodayStr();
        await task.save();

        const updatedTask = await StaffTask.findById(task._id)
            .populate("user", "username fullName profilePhoto role department jobTitle")
            .populate({
                path: "referencedTasks",
                select: "title status date user",
                populate: { path: "user", select: "username fullName profilePhoto" },
            })
            .populate("comments.user", "username fullName profilePhoto");

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error publishing draft:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task details
// @route   PUT /api/staff-tasks/:id
// @access  Private
exports.updateStaffTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await StaffTask.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const isOwner = task.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const {
            title,
            description,
            date,
            status,
            isDraft,
            isPrivate,
            priority,
            referencedTasks,
            adminSupportNote,
        } = req.body;

        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description;
        if (date !== undefined) task.date = date;
        if (priority !== undefined) task.priority = priority;
        if (isPrivate !== undefined) task.isPrivate = Boolean(isPrivate);
        if (referencedTasks !== undefined) task.referencedTasks = referencedTasks;
        if (adminSupportNote !== undefined) task.adminSupportNote = adminSupportNote;

        if (isDraft !== undefined) task.isDraft = Boolean(isDraft);
        if (status !== undefined) {
            task.status = status;
            if (status === "completed" && !task.completedAt) {
                task.completedAt = new Date();
            } else if (status !== "completed") {
                task.completedAt = null;
            }
        }

        await task.save();

        const updatedTask = await StaffTask.findById(task._id)
            .populate("user", "username fullName profilePhoto role department jobTitle")
            .populate({
                path: "referencedTasks",
                select: "title status date user",
                populate: { path: "user", select: "username fullName profilePhoto" },
            })
            .populate("comments.user", "username fullName profilePhoto");

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating staff task:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete staff task
// @route   DELETE /api/staff-tasks/:id
// @access  Private
exports.deleteStaffTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await StaffTask.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const isOwner = task.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await StaffTask.findByIdAndDelete(id);
        res.status(200).json({ message: "Task deleted successfully", id });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment to a task
// @route   POST /api/staff-tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const task = await StaffTask.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.comments.push({
            user: req.user._id,
            text: text.trim(),
            createdAt: new Date(),
        });

        await task.save();

        const updatedTask = await StaffTask.findById(task._id)
            .populate("user", "username fullName profilePhoto role department jobTitle")
            .populate({
                path: "referencedTasks",
                select: "title status date user",
                populate: { path: "user", select: "username fullName profilePhoto" },
            })
            .populate("comments.user", "username fullName profilePhoto");

        res.status(201).json(updatedTask);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Team Leaderboard (Leading vs Lagging Staff)
// @route   GET /api/staff-tasks/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
    try {
        const { period } = req.query; // 'today', 'week', 'month', 'all'
        const todayStr = getTodayStr();

        let dateFilter = {};
        if (period === "today" || !period) {
            dateFilter = { date: todayStr };
        } else if (period === "week") {
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            const startStr = startOfWeek.toISOString().split("T")[0];
            dateFilter = { date: { $gte: startStr, $lte: todayStr } };
        } else if (period === "month") {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startStr = startOfMonth.toISOString().split("T")[0];
            dateFilter = { date: { $gte: startStr, $lte: todayStr } };
        }

        // Ignore drafts in leaderboard performance metrics
        const baseQuery = {
            ...dateFilter,
            isDraft: { $ne: true },
            status: { $ne: "draft" },
        };

        const allUsers = await User.find({ isActive: true }).select(
            "username fullName profilePhoto role department jobTitle"
        );

        const tasks = await StaffTask.find(baseQuery);

        // Aggregate per user
        const statsMap = {};
        allUsers.forEach((u) => {
            statsMap[u._id.toString()] = {
                user: u,
                totalTasks: 0,
                completed: 0,
                inProgress: 0,
                adminSupport: 0,
                todo: 0,
                completionRate: 0,
                activityScore: 0,
            };
        });

        tasks.forEach((t) => {
            const uid = t.user.toString();
            if (!statsMap[uid]) {
                // If user not in active list for some reason
                return;
            }
            statsMap[uid].totalTasks += 1;
            if (t.status === "completed") {
                statsMap[uid].completed += 1;
            } else if (t.status === "in_progress") {
                statsMap[uid].inProgress += 1;
            } else if (t.status === "admin_support_needed") {
                statsMap[uid].adminSupport += 1;
            } else if (t.status === "todo") {
                statsMap[uid].todo += 1;
            }
        });

        const leaderboard = Object.values(statsMap).map((item) => {
            const rate =
                item.totalTasks > 0
                    ? Math.round((item.completed / item.totalTasks) * 100)
                    : 0;
            // Activity score: completed = 10pts, in_progress = 4pts, todo = 1pt, admin_support = 2pts
            const score =
                item.completed * 10 +
                item.inProgress * 4 +
                item.todo * 1 +
                item.adminSupport * 2;

            return {
                ...item,
                completionRate: rate,
                activityScore: score,
            };
        });

        // Sort descending by activityScore, then completed tasks
        leaderboard.sort((a, b) => b.activityScore - a.activityScore || b.completed - a.completed);

        // Classify Leading vs Behind
        const ranked = leaderboard.map((entry, index) => {
            let standing = "active";
            if (leaderboard.length > 1) {
                if (index === 0 && entry.activityScore > 0) {
                    standing = "leading";
                } else if (index < Math.ceil(leaderboard.length / 3) && entry.activityScore > 0) {
                    standing = "progressing";
                } else if (entry.totalTasks === 0 || (entry.totalTasks > 0 && entry.completionRate < 30)) {
                    standing = "behind";
                }
            }
            return {
                rank: index + 1,
                standing,
                ...entry,
            };
        });

        res.status(200).json({
            period: period || "today",
            date: todayStr,
            leaderboard: ranked,
            summary: {
                totalMembers: allUsers.length,
                activeToday: leaderboard.filter((u) => u.totalTasks > 0).length,
                totalCompleted: leaderboard.reduce((acc, u) => acc + u.completed, 0),
                totalTasks: leaderboard.reduce((acc, u) => acc + u.totalTasks, 0),
            },
        });
    } catch (error) {
        console.error("Error generating leaderboard:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Detailed Infographics (User or Team)
// @route   GET /api/staff-tasks/infographics
// @access  Private
exports.getStaffInfographics = async (req, res) => {
    try {
        const targetUserId = req.query.staffId || req.user._id;
        const todayStr = getTodayStr();

        // 7 days date list
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split("T")[0]);
        }

        // Today's tasks for user
        const todayTasks = await StaffTask.find({
            user: targetUserId,
            date: todayStr,
            isDraft: { $ne: true },
        });

        // 7 days tasks
        const weekTasks = await StaffTask.find({
            user: targetUserId,
            date: { $in: last7Days },
            isDraft: { $ne: true },
        });

        // All time completed
        const totalCompletedAllTime = await StaffTask.countDocuments({
            user: targetUserId,
            status: "completed",
        });

        // Total drafts
        const totalDrafts = await StaffTask.countDocuments({
            user: targetUserId,
            isDraft: true,
        });

        // Daily trend data for last 7 days
        const dailyTrend = last7Days.map((day) => {
            const dayT = weekTasks.filter((t) => t.date === day);
            const comp = dayT.filter((t) => t.status === "completed").length;
            const inProg = dayT.filter((t) => t.status === "in_progress").length;
            const sup = dayT.filter((t) => t.status === "admin_support_needed").length;
            const tod = dayT.filter((t) => t.status === "todo").length;
            return {
                date: day,
                dayName: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
                total: dayT.length,
                completed: comp,
                inProgress: inProg,
                adminSupport: sup,
                todo: tod,
            };
        });

        // Calculate active streak
        let streak = 0;
        for (let i = last7Days.length - 1; i >= 0; i--) {
            const day = last7Days[i];
            const comp = weekTasks.filter((t) => t.date === day && t.status === "completed").length;
            if (comp > 0) {
                streak++;
            } else if (day !== todayStr) {
                // Break streak only if not today (since today may not have ended yet)
                break;
            }
        }

        const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
        const todayInProgress = todayTasks.filter((t) => t.status === "in_progress").length;
        const todayAdminSupport = todayTasks.filter((t) => t.status === "admin_support_needed").length;
        const todayTodo = todayTasks.filter((t) => t.status === "todo").length;

        const todayRate =
            todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

        res.status(200).json({
            targetUserId,
            today: {
                total: todayTasks.length,
                completed: todayCompleted,
                inProgress: todayInProgress,
                adminSupport: todayAdminSupport,
                todo: todayTodo,
                completionRate: todayRate,
            },
            dailyTrend,
            streak,
            totalCompletedAllTime,
            totalDrafts,
        });
    } catch (error) {
        console.error("Error fetching staff infographics:", error);
        res.status(500).json({ message: error.message });
    }
};
