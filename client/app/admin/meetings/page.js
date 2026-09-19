"use client";

import { useEffect, useState, useRef } from "react";
import {
    Video, Calendar, Clock, Plus, Trash2, Edit3, Radio, Play,
    ExternalLink, Users, FileText, CheckCircle2, X, Loader2,
    AlertTriangle, Mic, Save, ChevronRight,
} from "lucide-react";
import { fetchMeetings, createMeeting, updateMeeting, deleteMeeting, uploadFile } from "@/lib/api";

const STATUS_BADGE = {
    scheduled: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-green-50 text-green-700 border-green-200 animate-pulse",
    ended: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABEL = {
    scheduled: "📅 Scheduled",
    active: "🟢 Live",
    ended: "⏹ Ended",
    cancelled: "❌ Cancelled",
};

const getNextThursdayAt11 = () => {
    const now = new Date();
    const lagosnow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    const day = lagosnow.getDay();
    const daysUntil = (4 - day + 7) % 7 || 7;
    const next = new Date(lagosnow);
    next.setDate(lagosnow.getDate() + daysUntil);
    next.setHours(11, 0, 0, 0);
    // Convert Lagos time back to UTC for the input value
    const utcOffset = 60; // WAT = UTC+1
    const utc = new Date(next.getTime() - utcOffset * 60000);
    return utc.toISOString().slice(0, 16);
};

export default function AdminMeetingsDashboard() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editNotesMeeting, setEditNotesMeeting] = useState(null);
    const [editRecordingMeeting, setEditRecordingMeeting] = useState(null);
    const [notesInput, setNotesInput] = useState("");
    const [recordingInput, setRecordingInput] = useState("");
    const [uploadingRec, setUploadingRec] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "Weekly Staff Meeting",
        scheduledAt: getNextThursdayAt11(),
        agenda: "Weekly performance review, task updates, and team sync.",
    });

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const data = await fetchMeetings({ limit: 50 });
            setMeetings(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMeetings(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const created = await createMeeting({
                ...form,
                scheduledAt: new Date(form.scheduledAt).toISOString(),
            });
            setMeetings((prev) => [created, ...prev]);
            setIsCreateOpen(false);
            setForm({ title: "Weekly Staff Meeting", scheduledAt: getNextThursdayAt11(), agenda: "Weekly performance review, task updates, and team sync." });
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (meeting, status) => {
        try {
            const updated = await updateMeeting(meeting._id, { status });
            setMeetings((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSaveNotes = async () => {
        if (!editNotesMeeting) return;
        setSaving(true);
        try {
            const updated = await updateMeeting(editNotesMeeting._id, { notes: notesInput });
            setMeetings((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
            setEditNotesMeeting(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRecording = async () => {
        if (!editRecordingMeeting || !recordingInput.trim()) return;
        setSaving(true);
        try {
            const updated = await updateMeeting(editRecordingMeeting._id, { recordingUrl: recordingInput.trim() });
            setMeetings((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
            setEditRecordingMeeting(null);
            setRecordingInput("");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUploadRecording = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingRec(true);
        try {
            const res = await uploadFile(file);
            setRecordingInput(res.url || res.filePath || "");
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploadingRec(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this meeting record?")) return;
        try {
            await deleteMeeting(id);
            setMeetings((prev) => prev.filter((m) => m._id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const upcomingMeetings = meetings.filter((m) => m.status === "scheduled" || m.status === "active");
    const pastMeetings = meetings.filter((m) => m.status === "ended" || m.status === "cancelled");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Meeting Room Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Schedule, manage & replay weekly voice meetings.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Schedule Meeting
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Meetings", value: meetings.length, color: "text-slate-800", bg: "bg-slate-50" },
                    { label: "Upcoming", value: upcomingMeetings.length, color: "text-amber-700", bg: "bg-amber-50" },
                    { label: "Completed", value: pastMeetings.filter((m) => m.status === "ended").length, color: "text-emerald-700", bg: "bg-emerald-50" },
                    { label: "Recordings", value: meetings.filter((m) => m.recordingUrl).length, color: "text-indigo-700", bg: "bg-indigo-50" },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-slate-200/80`}>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Upcoming Meetings */}
            <section className="space-y-3">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Upcoming & Active</h2>
                {loading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : upcomingMeetings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
                        <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-medium">No upcoming meetings. Schedule one above.</p>
                    </div>
                ) : (
                    upcomingMeetings.map((m) => (
                        <MeetingCard
                            key={m._id}
                            meeting={m}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEditNotes={() => { setEditNotesMeeting(m); setNotesInput(m.notes || ""); }}
                            onEditRecording={() => { setEditRecordingMeeting(m); setRecordingInput(m.recordingUrl || ""); }}
                        />
                    ))
                )}
            </section>

            {/* Past Meetings with Recordings */}
            {pastMeetings.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Past Meetings & Recordings</h2>
                    {pastMeetings.map((m) => (
                        <MeetingCard
                            key={m._id}
                            meeting={m}
                            isPast
                            onDelete={handleDelete}
                            onEditNotes={() => { setEditNotesMeeting(m); setNotesInput(m.notes || ""); }}
                            onEditRecording={() => { setEditRecordingMeeting(m); setRecordingInput(m.recordingUrl || ""); }}
                        />
                    ))}
                </section>
            )}

            {/* Create Meeting Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Schedule Meeting</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Meeting Title</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Date & Time (Nigeria Time)</label>
                                <input
                                    type="datetime-local"
                                    value={form.scheduledAt}
                                    onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                />
                                <p className="text-[11px] text-slate-400">Default: Next Thursday 11:00 AM WAT</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Agenda</label>
                                <textarea
                                    rows={3}
                                    value={form.agenda}
                                    onChange={(e) => setForm((f) => ({ ...f, agenda: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Notes Modal */}
            {editNotesMeeting && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Meeting Notes</h3>
                            <button onClick={() => setEditNotesMeeting(null)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            rows={6}
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            placeholder="Enter meeting notes, decisions, and action items..."
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setEditNotesMeeting(null)} className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="flex-1 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Notes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Recording Modal */}
            {editRecordingMeeting && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Attach Meeting Recording</h3>
                            <button onClick={() => setEditRecordingMeeting(null)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">Upload a recording file or paste a link (Google Drive, Dropbox, etc.).</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">Upload Recording File</label>
                                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                                    {uploadingRec ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                                    {uploadingRec ? "Uploading..." : "Click to upload audio/video file"}
                                    <input type="file" accept="audio/*,video/*" onChange={handleUploadRecording} className="hidden" disabled={uploadingRec} />
                                </label>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-1">Or paste a recording URL</label>
                                <input
                                    type="url"
                                    value={recordingInput}
                                    onChange={(e) => setRecordingInput(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditRecordingMeeting(null)} className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button
                                onClick={handleSaveRecording}
                                disabled={saving || !recordingInput.trim()}
                                className="flex-1 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Recording
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MeetingCard({ meeting, isPast, onStatusChange, onDelete, onEditNotes, onEditRecording }) {
    const scheduledStr = new Date(meeting.scheduledAt).toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 space-y-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900">{meeting.title}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[meeting.status] || STATUS_BADGE.scheduled}`}>
                                {STATUS_LABEL[meeting.status] || meeting.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {scheduledStr}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={onEditNotes}
                            title="Edit Notes"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Agenda */}
                {meeting.agenda && (
                    <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 leading-relaxed">
                        <span className="font-semibold text-slate-700">Agenda: </span>{meeting.agenda}
                    </p>
                )}

                {/* Notes */}
                {meeting.notes && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Meeting Notes</p>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{meeting.notes}</p>
                    </div>
                )}

                {/* Recording */}
                {meeting.recordingUrl ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <Play className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs font-semibold text-emerald-800 truncate">Recording available</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <a
                                href={meeting.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Play
                            </a>
                            <button
                                onClick={onEditRecording}
                                className="text-xs text-slate-400 hover:text-indigo-600"
                                title="Change recording"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onEditRecording}
                        className="w-full py-2 border border-dashed border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Mic className="w-3.5 h-3.5" /> Attach Recording
                    </button>
                )}

                {/* Status controls */}
                {!isPast && onStatusChange && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                        {meeting.status === "scheduled" && (
                            <button
                                onClick={() => onStatusChange(meeting, "active")}
                                className="px-3 py-1.5 text-[11px] font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                                <Radio className="w-3 h-3" /> Start Meeting
                            </button>
                        )}
                        {meeting.status === "active" && (
                            <button
                                onClick={() => onStatusChange(meeting, "ended")}
                                className="px-3 py-1.5 text-[11px] font-bold bg-slate-700 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5"
                            >
                                <CheckCircle2 className="w-3 h-3" /> Mark as Ended
                            </button>
                        )}
                        {meeting.status !== "cancelled" && (
                            <button
                                onClick={() => onStatusChange(meeting, "cancelled")}
                                className="px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                            >
                                Cancel Meeting
                            </button>
                        )}
                        <a
                            href={meeting.jitsiRoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" /> Open Room
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
