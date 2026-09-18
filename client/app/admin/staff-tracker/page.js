"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Kanban,
    Search,
    Calendar,
    Filter,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ListTodo,
    Lock,
    FileEdit,
    MessageSquare,
    Send,
    X,
    User,
    ArrowRight,
    RefreshCw,
    Shield,
    Trash2,
    Link2,
} from "lucide-react";
import {
    fetchStaffTasks,
    updateStaffTaskStatus,
    addStaffTaskComment,
    deleteStaffTask,
    fetchUsers,
} from "@/lib/api";

const COLUMNS = [
    { id: "draft", title: "Staff Drafts & Ideas", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: FileEdit },
    { id: "todo", title: "To Do", badge: "bg-slate-100 text-slate-700 border-slate-200", icon: ListTodo },
    { id: "in_progress", title: "In Progress", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    { id: "admin_support_needed", title: "Support Needed (SOS)", badge: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertTriangle },
    { id: "completed", title: "Done", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
];

export default function AdminStaffTracker() {
    const [tasks, setTasks] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("all");
    const [selectedStaff, setSelectedStaff] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [commentInput, setCommentInput] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchStaffTasks({
                date: selectedDate === "all" ? "" : selectedDate,
                staffId: selectedStaff === "all" ? "" : selectedStaff,
                status: statusFilter === "all" ? "" : statusFilter,
                search: searchQuery,
            });
            setTasks(data || []);
        } catch (err) {
            console.error("Error loading tasks for admin:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDate, selectedStaff, statusFilter]);

    useEffect(() => {
        fetchUsers()
            .then((res) => {
                if (Array.isArray(res)) setUsersList(res);
            })
            .catch(() => {});
    }, []);

    // SOS / Support Needed Tasks
    const supportNeededTasks = useMemo(() => {
        return tasks.filter((t) => t.status === "admin_support_needed");
    }, [tasks]);

    // Handle quick status update
    const handleStatusUpdate = async (task, newStatus) => {
        try {
            const updated = await updateStaffTaskStatus(task._id, { status: newStatus });
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            if (selectedTask?._id === task._id) {
                setSelectedTask(updated);
            }
        } catch (err) {
            alert(err.message || "Failed to update status");
        }
    };

    // Add admin comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentInput.trim() || !selectedTask) return;

        try {
            setSubmittingComment(true);
            const updated = await addStaffTaskComment(selectedTask._id, commentInput);
            setSelectedTask(updated);
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setCommentInput("");
        } catch (err) {
            alert(err.message || "Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Delete task
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this staff task?")) return;
        try {
            await deleteStaffTask(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
            if (selectedTask?._id === id) setSelectedTask(null);
        } catch (err) {
            alert(err.message || "Failed to delete task");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-border shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span>Staff Tasks & Kanban Oversight</span>
                        <Shield className="w-5 h-5 text-indigo-600" />
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Admin master view of all staff daily activities, private thoughts, incubator drafts, and support requests.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-colors shadow-xs"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Support Needed SOS Alert Banner */}
            {supportNeededTasks.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                            </span>
                            <h3 className="text-sm font-bold text-rose-900">
                                Staff Support Needed Queue ({supportNeededTasks.length})
                            </h3>
                        </div>
                        <span className="text-xs text-rose-700 font-medium">
                            Requires administrative action or guidance
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {supportNeededTasks.map((task) => (
                            <div
                                key={task._id}
                                onClick={() => setSelectedTask(task)}
                                className="bg-white p-3.5 rounded-lg border border-rose-200 shadow-xs hover:border-rose-400 transition-colors cursor-pointer space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{task.user?.fullName || task.user?.username}</span>
                                    </div>
                                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                                        SOS
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                    {task.title}
                                </h4>
                                {task.adminSupportNote && (
                                    <p className="text-[11px] text-rose-700 italic bg-rose-50/70 p-1.5 rounded">
                                        "{task.adminSupportNote}"
                                    </p>
                                )}
                                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                                    <span>Date: {task.date}</span>
                                    <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                        <span>View & Reply</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks, descriptions..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>

                {/* Staff Member Filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Staff:</span>
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-lg text-foreground focus:outline-none"
                    >
                        <option value="all">All Staff Members</option>
                        {usersList.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.fullName || u.username} ({u.role})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Date:</span>
                    <input
                        type="date"
                        value={selectedDate === "all" ? "" : selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value || "all")}
                        className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-lg text-foreground focus:outline-none"
                    />
                    {selectedDate !== "all" && (
                        <button
                            onClick={() => setSelectedDate("all")}
                            className="text-[11px] text-primary hover:underline font-semibold"
                        >
                            Clear Date
                        </button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-muted/40 border border-input rounded-lg text-foreground focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="draft">📝 Drafts</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="admin_support_needed">Support Needed</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Admin 5-Column Kanban Board (including Drafts) */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                {COLUMNS.map((col) => {
                    const Icon = col.icon;
                    const colTasks = tasks.filter((t) => {
                        if (col.id === "draft") {
                            return t.isDraft || t.status === "draft";
                        }
                        return t.status === col.id && !t.isDraft;
                    });

                    return (
                        <div
                            key={col.id}
                            className="bg-muted/30 rounded-xl p-3 border border-border flex flex-col min-h-[450px]"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-border mb-3 px-1">
                                <div className="flex items-center gap-1.5">
                                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                        {col.title}
                                    </h3>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${col.badge}`}>
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Task Cards */}
                            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                                {colTasks.length === 0 ? (
                                    <div className="h-24 border border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                                        Empty
                                    </div>
                                ) : (
                                    colTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            className="bg-card rounded-lg p-3 border border-border shadow-xs hover:border-primary/50 transition-all space-y-2 group"
                                        >
                                            {/* Creator Badge & Badges */}
                                            <div className="flex items-center justify-between gap-1 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    {task.user?.profilePhoto ? (
                                                        <img
                                                            src={task.user.profilePhoto}
                                                            alt={task.user.username}
                                                            className="w-5 h-5 rounded-full object-cover border border-border"
                                                        />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center">
                                                            {task.user?.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-semibold text-foreground text-[11px] truncate max-w-[90px]">
                                                        {task.user?.fullName || task.user?.username}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {task.isPrivate && (
                                                        <span className="p-0.5 rounded bg-purple-50 text-purple-700" title="Private to peers, visible to admin">
                                                            <Lock className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Title & Desc */}
                                            <div
                                                onClick={() => setSelectedTask(task)}
                                                className="cursor-pointer space-y-0.5"
                                            >
                                                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Support note snippet */}
                                            {task.status === "admin_support_needed" && task.adminSupportNote && (
                                                <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-800">
                                                    SOS: {task.adminSupportNote}
                                                </div>
                                            )}

                                            {/* Card Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                                                <span className="text-muted-foreground text-[10px]">{task.date}</span>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedTask(task)}
                                                        className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                                                    >
                                                        <MessageSquare className="w-3 h-3" />
                                                        <span>{task.comments?.length || 0}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(task._id)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                        title="Delete task"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
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

            {/* Task Details & Admin Guidance Drawer */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
                    <div className="bg-white max-w-lg w-full h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between border-l border-border animate-in slide-in-from-right duration-200">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-muted text-foreground">
                                        {selectedTask.priority}
                                    </span>
                                    {selectedTask.isPrivate && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            <span>Private</span>
                                        </span>
                                    )}
                                    {selectedTask.isDraft && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            📝 Draft
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">
                                    {selectedTask.title}
                                </h2>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                        <User className="w-3.5 h-3.5" />
                                        <span>
                                            {selectedTask.user?.fullName || selectedTask.user?.username} (
                                            {selectedTask.user?.department || selectedTask.user?.role})
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{selectedTask.date}</span>
                                    </div>
                                </div>

                                {selectedTask.description && (
                                    <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-foreground whitespace-pre-wrap">
                                        {selectedTask.description}
                                    </div>
                                )}

                                {selectedTask.status === "admin_support_needed" && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                                        <div className="flex items-center gap-2 font-bold text-rose-800 text-xs">
                                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                                            <span>Staff Member Support Alert</span>
                                        </div>
                                        <p className="text-xs text-rose-700 italic">
                                            "{selectedTask.adminSupportNote || "No note provided"}"
                                        </p>
                                    </div>
                                )}

                                {/* Admin Status Transition Buttons */}
                                <div className="space-y-1 pt-2">
                                    <label className="text-xs font-semibold text-foreground">
                                        Change Status as Admin
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {COLUMNS.filter((c) => c.id !== "draft").map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => handleStatusUpdate(selectedTask, c.id)}
                                                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                                                    selectedTask.status === c.id
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-muted/40 text-foreground border-border hover:bg-accent"
                                                }`}
                                            >
                                                {c.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-border" />

                            {/* Comment Thread */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Discussion & Guidance Thread ({selectedTask.comments?.length || 0})
                                </h4>

                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {selectedTask.comments?.length === 0 ? (
                                        <p className="text-xs text-muted-foreground py-3 text-center">
                                            No comments yet. Provide administrative guidance below.
                                        </p>
                                    ) : (
                                        selectedTask.comments?.map((c, i) => (
                                            <div
                                                key={i}
                                                className="p-2.5 bg-muted/30 rounded-xl border border-border text-xs space-y-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-foreground">
                                                        {c.user?.fullName || c.user?.username}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(c.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-foreground">{c.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Comment Input */}
                        <form onSubmit={handleAddComment} className="pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    placeholder="Write guidance or instructions to staff..."
                                    className="flex-1 px-3 py-2 text-xs bg-muted/40 border border-input rounded-xl focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingComment || !commentInput.trim()}
                                    className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
