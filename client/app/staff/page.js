"use client";

import { useEffect, useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
    Plus,
    Calendar,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ListTodo,
    Lock,
    FileEdit,
    MessageSquare,
    Link2,
    Send,
    X,
    User,
    Sparkles,
    Trash2,
    Check,
    ChevronRight,
    ArrowRight,
    Share2,
    Layers,
    Eye,
} from "lucide-react";
import {
    fetchStaffTasks,
    createStaffTask,
    updateStaffTaskStatus,
    publishStaffDraft,
    deleteStaffTask,
    addStaffTaskComment,
    fetchUsers,
} from "@/lib/api";

const getTodayDateStr = () => new Date().toISOString().split("T")[0];

const COLUMNS = [
    {
        id: "todo",
        title: "To Do",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        headerColor: "border-slate-300 text-slate-800",
        icon: ListTodo,
    },
    {
        id: "in_progress",
        title: "In Progress",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        headerColor: "border-amber-400 text-amber-800",
        icon: Clock,
    },
    {
        id: "admin_support_needed",
        title: "Admin Support Needed",
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
        headerColor: "border-rose-400 text-rose-800",
        icon: AlertTriangle,
    },
    {
        id: "completed",
        title: "Done / Completed",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        headerColor: "border-emerald-400 text-emerald-800",
        icon: CheckCircle2,
    },
];

const PRIORITY_BADGES = {
    low: "bg-slate-100 text-slate-600 border-slate-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    urgent: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
};

export default function StaffDailyKanban() {
    const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
    const [activeTab, setActiveTab] = useState("board"); // "board" or "drafts"
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersList, setUsersList] = useState([]);

    // Filters
    const [selectedStaffFilter, setSelectedStaffFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("all");

    // Modals & Drawers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
    const [supportNotePromptTask, setSupportNotePromptTask] = useState(null);
    const [supportNoteInput, setSupportNoteInput] = useState("");
    const [commentInput, setCommentInput] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Current logged in user ID from localStorage
    const currentUserId = typeof window !== "undefined" ? localStorage.getItem("adminId") : "";
    const currentUserRole = typeof window !== "undefined" ? localStorage.getItem("adminRole") : "";

    // Form state for creating task / draft
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        date: getTodayDateStr(),
        isDraft: false,
        isPrivate: false,
        referencedTasks: [],
        adminSupportNote: "",
    });

    // Fetch tasks & users
    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchStaffTasks({
                date: activeTab === "drafts" ? "all" : selectedDate,
                search: searchQuery,
            });
            setTasks(data || []);
        } catch (err) {
            console.error("Failed to load tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDate, activeTab]);

    useEffect(() => {
        fetchUsers()
            .then((res) => {
                if (Array.isArray(res)) setUsersList(res);
            })
            .catch(() => {});
    }, []);

    // Filtered tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            if (activeTab === "drafts") {
                if (!t.isDraft && t.status !== "draft") return false;
            } else {
                if (t.isDraft || t.status === "draft") return false;
            }

            if (selectedStaffFilter === "my") {
                if (t.user?._id !== currentUserId) return false;
            } else if (selectedStaffFilter !== "all") {
                if (t.user?._id !== selectedStaffFilter) return false;
            }

            if (priorityFilter !== "all" && t.priority !== priorityFilter) {
                return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = t.title?.toLowerCase().includes(q);
                const matchDesc = t.description?.toLowerCase().includes(q);
                const matchUser = t.user?.username?.toLowerCase().includes(q) || t.user?.fullName?.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchUser) return false;
            }

            return true;
        });
    }, [tasks, activeTab, selectedStaffFilter, priorityFilter, searchQuery, currentUserId]);

    // Fast status transition
    const handleStatusChange = async (task, newStatus) => {
        if (newStatus === "admin_support_needed" && task.status !== "admin_support_needed") {
            setSupportNotePromptTask(task);
            setSupportNoteInput(task.adminSupportNote || "");
            return;
        }

        try {
            const updated = await updateStaffTaskStatus(task._id, { status: newStatus });
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

            if (newStatus === "completed") {
                confetti({
                    particleCount: 75,
                    spread: 60,
                    origin: { y: 0.7 },
                });
            }

            if (selectedTaskForDetails?._id === task._id) {
                setSelectedTaskForDetails(updated);
            }
        } catch (err) {
            alert(err.message || "Failed to update status");
        }
    };

    // Save Admin Support Note and update status
    const handleConfirmSupportNote = async () => {
        if (!supportNotePromptTask) return;
        try {
            const updated = await updateStaffTaskStatus(supportNotePromptTask._id, {
                status: "admin_support_needed",
                adminSupportNote: supportNoteInput.trim(),
            });
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setSupportNotePromptTask(null);
            setSupportNoteInput("");
        } catch (err) {
            alert(err.message || "Failed to submit support request");
        }
    };

    // Publish Draft to Board
    const handlePublishDraft = async (task) => {
        try {
            const updated = await publishStaffDraft(task._id, selectedDate);
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            confetti({
                particleCount: 50,
                spread: 45,
                origin: { y: 0.8 },
            });
            setActiveTab("board");
        } catch (err) {
            alert(err.message || "Failed to publish draft");
        }
    };

    // Delete Task
    const handleDeleteTask = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteStaffTask(taskId);
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            if (selectedTaskForDetails?._id === taskId) {
                setSelectedTaskForDetails(null);
            }
        } catch (err) {
            alert(err.message || "Failed to delete task");
        }
    };

    // Submit Task / Draft Form
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                date: formData.date || selectedDate,
            };
            const created = await createStaffTask(payload);
            setTasks((prev) => [created, ...prev]);
            setIsCreateModalOpen(false);
            setFormData({
                title: "",
                description: "",
                priority: "medium",
                date: selectedDate,
                isDraft: false,
                isPrivate: false,
                referencedTasks: [],
                adminSupportNote: "",
            });
            if (payload.isDraft) {
                setActiveTab("drafts");
            }
        } catch (err) {
            alert(err.message || "Failed to create task");
        }
    };

    // Submit Comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentInput.trim() || !selectedTaskForDetails) return;
        try {
            setSubmittingComment(true);
            const updated = await addStaffTaskComment(selectedTaskForDetails._id, commentInput);
            setSelectedTaskForDetails(updated);
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setCommentInput("");
        } catch (err) {
            alert(err.message || "Failed to send comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Quick stats for the current day
    const dayStats = useMemo(() => {
        const nonDrafts = tasks.filter((t) => !t.isDraft && t.status !== "draft");
        const total = nonDrafts.length;
        const completed = nonDrafts.filter((t) => t.status === "completed").length;
        const inProgress = nonDrafts.filter((t) => t.status === "in_progress").length;
        const support = nonDrafts.filter((t) => t.status === "admin_support_needed").length;
        const draftsCount = tasks.filter((t) => t.isDraft || t.status === "draft").length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, inProgress, support, draftsCount, rate };
    }, [tasks]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Daily Activity & Performance Tracker
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Live
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Log your daily goals, track live progress in Kanban columns, collaborate with peers, and incubate private drafts.
                    </p>
                </div>

                {/* Date Controls & New Task CTA */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Presets */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setSelectedDate(getTodayDateStr())}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                selectedDate === getTodayDateStr()
                                    ? "bg-white text-indigo-600 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(d.toISOString().split("T")[0]);
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                selectedDate !== getTodayDateStr()
                                    ? "bg-white text-indigo-600 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            History
                        </button>
                        <div className="relative flex items-center pl-2 pr-1 border-l border-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3.5" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pl-6 pr-2 py-1 text-xs font-medium text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* New Task Button */}
                    <button
                        onClick={() => {
                            setFormData((prev) => ({ ...prev, date: selectedDate, isDraft: false }));
                            setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Daily Task</span>
                    </button>
                </div>
            </div>

            {/* Quick Infographic Overview Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        Today's Tasks
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-bold text-slate-900">{dayStats.total}</span>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Total
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        Done / Completed
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-bold text-emerald-600">{dayStats.completed}</span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {dayStats.rate}%
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        In Progress
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-bold text-amber-600">{dayStats.inProgress}</span>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            Active
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        Support Requests
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-bold text-rose-600">{dayStats.support}</span>
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            SOS
                        </span>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab("drafts")}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-indigo-300 transition-colors col-span-2 sm:col-span-1"
                >
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        My Drafts & Ideas
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-bold text-indigo-600">{dayStats.draftsCount}</span>
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Private
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Bar & Tab Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                    <button
                        onClick={() => setActiveTab("board")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                            activeTab === "board"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>Daily Kanban Board</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("drafts")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                            activeTab === "drafts"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        <FileEdit className="w-4 h-4" />
                        <span>Drafts & Ideas Incubator</span>
                        {dayStats.draftsCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                                {dayStats.draftsCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search & Select Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-56">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks or staff..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400 shadow-xs"
                        />
                    </div>

                    {/* Staff Filter */}
                    <select
                        value={selectedStaffFilter}
                        onChange={(e) => setSelectedStaffFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                    >
                        <option value="all">👥 All Staff Tasks</option>
                        <option value="my">👤 My Tasks Only</option>
                        {usersList.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.fullName || u.username} ({u.department || u.role})
                            </option>
                        ))}
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                    >
                        <option value="all">⚡ All Priorities</option>
                        <option value="urgent">🔴 Urgent</option>
                        <option value="high">🟠 High</option>
                        <option value="medium">🔵 Medium</option>
                        <option value="low">⚪ Low</option>
                    </select>
                </div>
            </div>

            {/* Main Content: Board View OR Drafts View */}
            {activeTab === "board" ? (
                /* Kanban Columns */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    {COLUMNS.map((col) => {
                        const Icon = col.icon;
                        const colTasks = filteredTasks.filter((t) => t.status === col.id);

                        return (
                            <div
                                key={col.id}
                                className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-h-[480px]"
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-slate-600" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            {col.title}
                                        </h3>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-bold border ${col.badgeColor}`}
                                    >
                                        {colTasks.length}
                                    </span>
                                </div>

                                {/* Task Cards */}
                                <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                                    {colTasks.length === 0 ? (
                                        <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                            <p className="text-xs font-medium">No tasks in this column</p>
                                            <button
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        status: col.id,
                                                        date: selectedDate,
                                                    }));
                                                    setIsCreateModalOpen(true);
                                                }}
                                                className="mt-2 text-[11px] text-indigo-600 font-semibold hover:underline"
                                            >
                                                + Add task here
                                            </button>
                                        </div>
                                    ) : (
                                        colTasks.map((task) => (
                                            <div
                                                key={task._id}
                                                className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-3 group"
                                            >
                                                {/* Header: Priority & Badges */}
                                                <div className="flex items-center justify-between gap-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                                                                PRIORITY_BADGES[task.priority] ||
                                                                PRIORITY_BADGES.medium
                                                            }`}
                                                        >
                                                            {task.priority}
                                                        </span>

                                                        {task.isPrivate && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                                                <Lock className="w-2.5 h-2.5" />
                                                                <span>Private</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Fast Status Action Dropdown */}
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(task, e.target.value)
                                                        }
                                                        className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700 focus:outline-none"
                                                    >
                                                        <option value="todo">To Do</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="admin_support_needed">
                                                            SOS Support
                                                        </option>
                                                        <option value="completed">Done</option>
                                                    </select>
                                                </div>

                                                {/* Title & Description */}
                                                <div
                                                    onClick={() => setSelectedTaskForDetails(task)}
                                                    className="cursor-pointer space-y-1"
                                                >
                                                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                        {task.title}
                                                    </h4>
                                                    {task.description && (
                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Admin Support Alert box if applicable */}
                                                {task.status === "admin_support_needed" && (
                                                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                                                        <div className="flex items-center gap-1.5 font-semibold text-rose-700 text-[11px]">
                                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                            <span>Support Needed</span>
                                                        </div>
                                                        {task.adminSupportNote && (
                                                            <p className="text-[11px] text-rose-600">
                                                                "{task.adminSupportNote}"
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Referenced Tasks Tag */}
                                                {task.referencedTasks && task.referencedTasks.length > 0 && (
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 truncate">
                                                        <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                                                        <span className="truncate">
                                                            Ref: {task.referencedTasks[0]?.title || "Related Task"}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Card Footer: Creator & Comment Button */}
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        {task.user?.profilePhoto ? (
                                                            <img
                                                                src={task.user.profilePhoto}
                                                                alt={task.user.username}
                                                                className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center">
                                                                {task.user?.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]">
                                                            {task.user?.fullName || task.user?.username}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Comments Counter Button */}
                                                        <button
                                                            onClick={() => setSelectedTaskForDetails(task)}
                                                            className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 text-[11px] font-medium transition-colors"
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            <span>{task.comments?.length || 0}</span>
                                                        </button>

                                                        {/* Delete button for task owner or admin */}
                                                        {(task.user?._id === currentUserId ||
                                                            currentUserRole === "admin") && (
                                                            <button
                                                                onClick={() => handleDeleteTask(task._id)}
                                                                className="text-slate-300 hover:text-rose-500 transition-colors"
                                                                title="Delete task"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Drafts & Ideas Incubator View */
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                My Drafts & Ideas Incubator
                            </h3>
                            <p className="text-xs text-slate-500">
                                Ideas and tasks saved here stay private from your peers. Only you and Admin can view them. Publish anytime to the live Kanban board.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setFormData((prev) => ({ ...prev, isDraft: true, date: selectedDate }));
                                setIsCreateModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Draft Idea</span>
                        </button>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 space-y-2">
                            <FileEdit className="w-10 h-10 mx-auto text-slate-300" />
                            <p className="text-sm font-semibold text-slate-600">No drafts in your incubator</p>
                            <p className="text-xs text-slate-400">
                                Draft pending tasks or ideas to think through before broadcasting to the team.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTasks.map((draft) => (
                                <div
                                    key={draft._id}
                                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white shadow-xs transition-all space-y-3 flex flex-col justify-between"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                📝 Draft
                                            </span>
                                            <span
                                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                                                    PRIORITY_BADGES[draft.priority] || PRIORITY_BADGES.medium
                                                }`}
                                            >
                                                {draft.priority}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-sm text-slate-900">
                                            {draft.title}
                                        </h4>
                                        {draft.description && (
                                            <p className="text-xs text-slate-500 line-clamp-3">
                                                {draft.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                                        <button
                                            onClick={() => handleDeleteTask(draft._id)}
                                            className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Delete</span>
                                        </button>

                                        <button
                                            onClick={() => handlePublishDraft(draft)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                                        >
                                            <ArrowRight className="w-3.5 h-3.5" />
                                            <span>Publish to Board</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create Task / Draft Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {formData.isDraft ? "Create New Draft" : "Add Daily Task"}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {formData.isDraft
                                        ? "Save as a draft private to peers (visible to Admin)"
                                        : "Post a daily todo visible on the staff Kanban board"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Review chemical plant logistics report"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Details, objectives, links or notes for this task..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, date: e.target.value }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, priority: e.target.value }))
                                        }
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reference Another Staff Task */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Reference another staff task (Optional)
                                </label>
                                <select
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => ({
                                            ...prev,
                                            referencedTasks: val ? [val] : [],
                                        }));
                                    }}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                                >
                                    <option value="">None (Standalone task)</option>
                                    {tasks
                                        .filter((t) => !t.isDraft && t.status !== "draft")
                                        .map((t) => (
                                            <option key={t._id} value={t._id}>
                                                [{t.user?.username}]: {t.title} ({t.status})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Visibility Toggles */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-semibold text-slate-800">
                                        Save as Draft (Private Incubator)
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={formData.isDraft}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isDraft: e.target.checked,
                                                status: e.target.checked ? "draft" : "todo",
                                            }))
                                        }
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                </label>
                                <p className="text-[11px] text-slate-500">
                                    Drafts are hidden from your team members. You can review, edit, and publish them later.
                                </p>

                                <hr className="border-slate-200/60" />

                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                        <Lock className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Private Todo</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPrivate}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isPrivate: e.target.checked,
                                            }))
                                        }
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                </label>
                                <p className="text-[11px] text-slate-500">
                                    Private todos stay hidden from fellow staff, but are visible to the Admin dashboard.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
                                >
                                    {formData.isDraft ? "Save Draft" : "Add to Kanban"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Details & Collaborative Comments Drawer */}
            {selectedTaskForDetails && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
                    <div className="bg-white max-w-lg w-full h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
                        <div className="space-y-5">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                                            PRIORITY_BADGES[selectedTaskForDetails.priority] ||
                                            PRIORITY_BADGES.medium
                                        }`}
                                    >
                                        {selectedTaskForDetails.priority}
                                    </span>
                                    {selectedTaskForDetails.isPrivate && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            <span>Private</span>
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedTaskForDetails(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Task Content */}
                            <div className="space-y-3">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {selectedTaskForDetails.title}
                                </h2>

                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="font-semibold text-slate-700">
                                            {selectedTaskForDetails.user?.fullName ||
                                                selectedTaskForDetails.user?.username}
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{selectedTaskForDetails.date}</span>
                                    </div>
                                </div>

                                {selectedTaskForDetails.description && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedTaskForDetails.description}
                                    </div>
                                )}

                                {/* Admin Support Status Alert */}
                                {selectedTaskForDetails.status === "admin_support_needed" && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                                        <div className="flex items-center gap-2 font-bold text-rose-800 text-xs">
                                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                                            <span>Admin Support Requested</span>
                                        </div>
                                        {selectedTaskForDetails.adminSupportNote && (
                                            <p className="text-xs text-rose-700">
                                                Note: {selectedTaskForDetails.adminSupportNote}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Referenced Task Card */}
                                {selectedTaskForDetails.referencedTasks &&
                                    selectedTaskForDetails.referencedTasks.length > 0 && (
                                        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
                                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                                                <Link2 className="w-3 h-3" />
                                                Referenced Colleague Task
                                            </span>
                                            <p className="text-xs font-semibold text-indigo-900">
                                                {selectedTaskForDetails.referencedTasks[0]?.title}
                                            </p>
                                            <span className="text-[10px] text-indigo-600">
                                                Status: {selectedTaskForDetails.referencedTasks[0]?.status}
                                            </span>
                                        </div>
                                    )}

                                {/* Interactive Status Selector */}
                                <div className="space-y-1 pt-2">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Update Task Status
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {COLUMNS.map((col) => (
                                            <button
                                                key={col.id}
                                                type="button"
                                                onClick={() =>
                                                    handleStatusChange(selectedTaskForDetails, col.id)
                                                }
                                                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                                                    selectedTaskForDetails.status === col.id
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                <span>{col.title}</span>
                                                {selectedTaskForDetails.status === col.id && (
                                                    <Check className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Collaborative Comments Thread */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Team Comments & Feedback ({selectedTaskForDetails.comments?.length || 0})
                                    </h4>
                                </div>

                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {selectedTaskForDetails.comments?.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-4 text-center">
                                            No comments yet. Start the conversation!
                                        </p>
                                    ) : (
                                        selectedTaskForDetails.comments?.map((c, i) => (
                                            <div
                                                key={i}
                                                className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        {c.user?.profilePhoto ? (
                                                            <img
                                                                src={c.user.profilePhoto}
                                                                alt={c.user.username}
                                                                className="w-4 h-4 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[8px] font-bold flex items-center justify-center">
                                                                {c.user?.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-[11px] font-bold text-slate-800">
                                                            {c.user?.fullName || c.user?.username}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(c.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-700 pl-5">{c.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comment Input Box */}
                        <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    placeholder="Write a comment or advice..."
                                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingComment || !commentInput.trim()}
                                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Support Note Input Prompt Modal */}
            {supportNotePromptTask && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Request Admin Support
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Let management know what you need to move this task forward.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">
                                What support or guidance do you need?
                            </label>
                            <textarea
                                rows={3}
                                required
                                value={supportNoteInput}
                                onChange={(e) => setSupportNoteInput(e.target.value)}
                                placeholder="e.g., Need approval for chemical sample budget or access to analytics portal"
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setSupportNotePromptTask(null)}
                                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSupportNote}
                                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                            >
                                Submit Support Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
