"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Video, VideoOff, Mic, MicOff, PhoneOff, Users, MessageSquare,
    Send, X, Calendar, Clock, AlertTriangle, ExternalLink, Shield,
    Loader2, ChevronRight, Radio,
} from "lucide-react";
import { fetchNextMeeting, updateMeeting, API_URL } from "@/lib/api";
import io from "socket.io-client";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

const getNigeriaTime = () => {
    const now = new Date();
    return new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(now);
};

const isThursdayMeetingTime = () => {
    const now = new Date();
    const lagos = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    const day = lagos.getDay(); // 4 = Thursday
    const hour = lagos.getHours();
    return day === 4 && hour >= 10 && hour < 13; // 10am-1pm buffer
};

export default function StaffMeetingRoom() {
    const router = useRouter();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joined, setJoined] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState("");
    const [participants, setParticipants] = useState([]);
    const [meetingEnded, setMeetingEnded] = useState(false);
    const socketRef = useRef(null);
    const jitsiContainer = useRef(null);
    const jitsiApi = useRef(null);

    const currentUserId = typeof window !== "undefined" ? localStorage.getItem("adminId") : "";
    const currentUsername = typeof window !== "undefined" ? localStorage.getItem("adminUsername") : "Staff";
    const currentRole = typeof window !== "undefined" ? localStorage.getItem("adminRole") : "";
    const isAdmin = currentRole === "admin";

    // Load next meeting
    useEffect(() => {
        fetchNextMeeting()
            .then((data) => setMeeting(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Socket connection
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("meeting-started", () => {
            setMeetingEnded(false);
        });

        socket.on("meeting-ended", () => {
            setMeetingEnded(true);
            if (jitsiApi.current) {
                jitsiApi.current.dispose();
                jitsiApi.current = null;
            }
        });

        socket.on("room-participants", (list) => setParticipants(list));
        socket.on("user-joined", (user) => {
            setParticipants((prev) => {
                const exists = prev.find((p) => p.userId === user.userId);
                return exists ? prev : [...prev, user];
            });
        });
        socket.on("user-left", (user) => {
            setParticipants((prev) => prev.filter((p) => p.userId !== user.userId));
        });
        socket.on("meeting-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.disconnect();
    }, []);

    // Load Jitsi Meet API when user joins
    const handleJoinMeeting = useCallback(() => {
        if (!meeting) return;

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => {
            if (!window.JitsiMeetExternalAPI || !jitsiContainer.current) return;

            const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
                roomName: meeting.roomName,
                parentNode: jitsiContainer.current,
                width: "100%",
                height: "100%",
                userInfo: { displayName: currentUsername },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: true,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    enableClosePage: false,
                    subject: meeting.title || "Weekly Staff Meeting",
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        "microphone", "camera", "closedcaptions", "desktop", "fullscreen",
                        "fodeviceselection", "hangup", "chat", "raisehand", "videoquality",
                        "filmstrip", "shortcuts", "tileview", "select-background", "mute-everyone",
                    ],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: "#1e1b4b",
                },
            });

            jitsiApi.current = api;

            api.on("readyToClose", () => {
                setJoined(false);
                api.dispose();
                jitsiApi.current = null;
            });
        };

        document.head.appendChild(script);
        setJoined(true);

        // Notify via socket
        if (socketRef.current && meeting) {
            socketRef.current.emit("join-meeting", {
                roomName: meeting.roomName,
                userId: currentUserId,
                username: currentUsername,
            });
        }
    }, [meeting, currentUserId, currentUsername]);

    const handleAdminStartMeeting = async () => {
        if (!meeting) return;
        try {
            await updateMeeting(meeting._id, { status: "active" });
            socketRef.current?.emit("meeting-started", { roomName: meeting.roomName });
            setMeeting((m) => ({ ...m, status: "active" }));
            handleJoinMeeting();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAdminEndMeeting = async () => {
        if (!meeting || !confirm("Are you sure you want to end the meeting for everyone?")) return;
        try {
            await updateMeeting(meeting._id, { status: "ended" });
            socketRef.current?.emit("meeting-ended", { roomName: meeting.roomName });
            setMeetingEnded(true);
            jitsiApi.current?.dispose();
            jitsiApi.current = null;
            setJoined(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSaveRecordingUrl = async (url) => {
        if (!meeting || !url.trim()) return;
        try {
            await updateMeeting(meeting._id, { recordingUrl: url.trim() });
            setMeeting((m) => ({ ...m, recordingUrl: url.trim() }));
            alert("Recording URL saved!");
        } catch (err) {
            alert(err.message);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!msgInput.trim() || !socketRef.current || !meeting) return;
        socketRef.current.emit("meeting-message", {
            roomName: meeting.roomName,
            message: msgInput.trim(),
            username: currentUsername,
            userId: currentUserId,
        });
        setMsgInput("");
    };

    const scheduledStr = meeting?.scheduledAt
        ? new Date(meeting.scheduledAt).toLocaleString("en-NG", {
              timeZone: "Africa/Lagos",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-sm text-slate-500 font-medium">Loading meeting room...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900">Weekly Voice Meeting</h1>
                            {meeting?.status === "active" && (
                                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold animate-pulse">
                                    <Radio className="w-3 h-3" /> LIVE
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            Every Thursday • 11:00 AM – 12:00 PM Nigeria Time
                        </p>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                        🇳🇬 {getNigeriaTime()}
                    </div>
                </div>
            </div>

            {/* No meeting scheduled */}
            {!meeting && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center space-y-3">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-800">No Meeting Scheduled</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        The next weekly meeting hasn't been scheduled yet. Admin will initiate a meeting each Thursday at 11 AM WAT.
                    </p>
                    {isAdmin && (
                        <button
                            onClick={() => router.push("/admin/meetings")}
                            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                        >
                            <Shield className="w-4 h-4" />
                            <span>Schedule Meeting (Admin)</span>
                        </button>
                    )}
                </div>
            )}

            {/* Meeting card */}
            {meeting && !joined && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    {/* Meeting Banner */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur mx-auto flex items-center justify-center">
                            <Video className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold">{meeting.title || "Weekly Staff Meeting"}</h2>
                        <p className="text-indigo-200 text-sm">{scheduledStr}</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                meeting.status === "active"
                                    ? "bg-green-400/30 text-green-100 border border-green-400/50"
                                    : meeting.status === "ended"
                                    ? "bg-slate-400/30 text-slate-200 border border-slate-400/50"
                                    : "bg-amber-400/30 text-amber-100 border border-amber-400/50"
                            }`}>
                                {meeting.status === "active" ? "🟢 Live Now" : meeting.status === "ended" ? "⏹ Ended" : "🕐 Scheduled"}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {meeting.agenda && (
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Agenda</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{meeting.agenda}</p>
                            </div>
                        )}

                        {meetingEnded && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-600 text-sm font-medium">
                                ⏹ This meeting has ended. Check the admin dashboard for recordings.
                            </div>
                        )}

                        {/* Admin controls */}
                        {isAdmin && meeting.status === "scheduled" && (
                            <button
                                onClick={handleAdminStartMeeting}
                                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-green-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <Radio className="w-4 h-4" /> Start Meeting Now
                            </button>
                        )}

                        {/* Join button — staff when meeting is active */}
                        {meeting.status === "active" && !meetingEnded && (
                            <button
                                onClick={handleJoinMeeting}
                                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <Video className="w-4 h-4" /> Join Voice Meeting
                            </button>
                        )}

                        {/* Direct Jitsi link as fallback */}
                        <a
                            href={meeting.jitsiRoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-6 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" /> Open in Jitsi App
                        </a>
                    </div>
                </div>
            )}

            {/* Live meeting room embed */}
            {joined && (
                <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                    {/* Meeting toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 animate-pulse">
                                <Radio className="w-3 h-3" /> LIVE MEETING
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setChatOpen(!chatOpen)}
                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors relative"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {messages.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[10px] text-white font-bold flex items-center justify-center">
                                        {messages.length > 9 ? "9+" : messages.length}
                                    </span>
                                )}
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={handleAdminEndMeeting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    <PhoneOff className="w-3.5 h-3.5" /> End for All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Jitsi iframe container */}
                    <div className="relative" style={{ height: "560px" }}>
                        <div ref={jitsiContainer} className="w-full h-full" />
                    </div>
                </div>
            )}

            {/* Side chat panel */}
            {joined && chatOpen && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col" style={{ height: "360px" }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900">Meeting Chat</h4>
                        <button onClick={() => setChatOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {messages.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">No messages yet. Say hello!</p>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.userId === currentUserId ? "items-end" : "items-start"}`}>
                                    <span className="text-[10px] text-slate-400 mb-0.5">{m.username}</span>
                                    <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] ${
                                        m.userId === currentUserId
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-100 text-slate-800"
                                    }`}>
                                        {m.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={sendMessage} className="p-3 border-t border-slate-100 flex gap-2">
                        <input
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                        />
                        <button
                            type="submit"
                            disabled={!msgInput.trim()}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
