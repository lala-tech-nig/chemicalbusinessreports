"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video, Calendar, Clock, Bell, X, ShieldAlert } from "lucide-react";
import { fetchNextMeeting } from "@/lib/api";

export default function MeetingReminderPopup() {
    const [meeting, setMeeting] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [hoursLeft, setHoursLeft] = useState(null);

    useEffect(() => {
        // Don't show if dismissed in this session
        const dismissedKey = "meeting_reminder_dismissed_" + new Date().toDateString();
        if (sessionStorage.getItem(dismissedKey)) {
            return;
        }

        const checkMeeting = async () => {
            try {
                const next = await fetchNextMeeting();
                if (!next) return;

                setMeeting(next);

                if (next.status === "active") {
                    setIsLive(true);
                    setIsOpen(true);
                    return;
                }

                // Check time difference
                const sched = new Date(next.scheduledAt).getTime();
                const now = Date.now();
                const diffMs = sched - now;
                const diffHours = diffMs / (1000 * 60 * 60);

                // Show reminder popup if meeting is scheduled within 36 hours (e.g. Wednesday reminder for Thursday 11am)
                // Or if it's currently Thursday before meeting
                if (diffHours > 0 && diffHours <= 36) {
                    setHoursLeft(Math.round(diffHours));
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Meeting reminder check error:", err);
            }
        };

        checkMeeting();
        const interval = setInterval(checkMeeting, 60000 * 5); // check every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        setDismissed(true);
        const dismissedKey = "meeting_reminder_dismissed_" + new Date().toDateString();
        sessionStorage.setItem(dismissedKey, "true");
    };

    if (!isOpen || !meeting) return null;

    const formattedDate = new Date(meeting.scheduledAt).toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
            <div className={`p-5 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                isLive
                    ? "bg-emerald-950/90 text-white border-emerald-500/50 shadow-emerald-950/50 ring-2 ring-emerald-500/30"
                    : "bg-slate-900/95 text-white border-indigo-500/30 shadow-indigo-950/50"
            }`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isLive
                                ? "bg-emerald-500 text-white animate-pulse"
                                : "bg-indigo-600 text-white"
                        }`}>
                            {isLive ? <Video className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    isLive
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                }`}>
                                    {isLive ? "Live Voice Meeting" : "Weekly Voice Meeting Reminder"}
                                </span>
                            </div>
                            <h4 className="text-base font-bold mt-1 text-white">
                                {isLive ? "Staff Meeting is Live Now!" : "Upcoming Thursday Meeting"}
                            </h4>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        title="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-3 text-xs text-slate-300 space-y-1 bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{formattedDate} (WAT - Nigeria Time)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>11:00 AM – 12:00 PM WAT</span>
                    </div>
                    {meeting.agenda && (
                        <p className="pt-1 text-slate-400 line-clamp-2 italic">
                            &ldquo;{meeting.agenda}&rdquo;
                        </p>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Link
                        href="/staff/meeting"
                        onClick={() => setIsOpen(false)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                            isLive
                                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                        }`}
                    >
                        <Video className="w-4 h-4" />
                        <span>{isLive ? "Join Live Meeting Now" : "Go to Meeting Room"}</span>
                    </Link>
                    <button
                        onClick={handleDismiss}
                        className="px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Remind Later
                    </button>
                </div>
            </div>
        </div>
    );
}
