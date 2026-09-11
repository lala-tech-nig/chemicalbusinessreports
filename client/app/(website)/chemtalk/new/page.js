"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    GraduationCap,
    FileText,
    MessageSquare,
    Building,
    Upload,
    Loader2,
    X,
    Sparkles,
    CheckCircle2,
    FileUp,
    Send,
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import AuthModal from "@/components/community/AuthModal";
import { createCommunityPost, uploadFile } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
    "Industrial & Petrochemicals",
    "Pharmaceutical & Medicinal",
    "Cosmetics & Personal Care",
    "Green Chemistry & Circular Economy",
    "Agrochemicals & Fertilizers",
    "Polymers & Materials Science",
    "Process Engineering & Plant Ops",
    "General ChemTalk",
];

export default function NewChemTalkPostPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: "Industrial & Petrochemicals",
        type: "thesis",
        abstract: "",
        content: "",
        coverImage: "",
        attachmentUrl: "",
        attachmentName: "",
        tags: "",
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("communityUser");
            if (stored) {
                try {
                    setCurrentUser(JSON.parse(stored));
                } catch {
                    setCurrentUser(null);
                }
            }
            setCheckingAuth(false);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setFormData((prev) => ({ ...prev, content }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const res = await uploadFile(file);
            setFormData((prev) => ({ ...prev, coverImage: res.filePath || res.url }));
            toast.success("Cover image uploaded successfully!");
        } catch (err) {
            toast.error("Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPdf(true);
        try {
            const res = await uploadFile(file);
            setFormData((prev) => ({
                ...prev,
                attachmentUrl: res.filePath || res.url,
                attachmentName: file.name,
            }));
            toast.success("Document attached successfully!");
        } catch (err) {
            toast.error("Failed to upload document");
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        if (!formData.content.trim()) {
            toast.error("Please write the thesis or article body content");
            return;
        }

        setSubmitting(true);
        try {
            const post = await createCommunityPost(formData);
            toast.success("Published successfully to ChemTalk!");
            router.push(`/chemtalk/${post.slug}`);
        } catch (err) {
            toast.error(err.message || "Failed to publish post");
        } finally {
            setSubmitting(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-[#f8fafc]">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Sign in to Publish</h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            To publish a chemical thesis, technical whitepaper, or initiate an industry debate on ChemTalk, please sign in with your contributor account or register in seconds.
                        </p>
                        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
                            >
                                Sign In / Register
                            </button>
                            <Link
                                href="/chemtalk"
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                            >
                                Back to ChemTalk
                            </Link>
                        </div>
                    </div>
                </div>

                <AuthModal
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    initialMode="register"
                    onAuthSuccess={(user) => setCurrentUser(user)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20 bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    href="/chemtalk"
                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to ChemTalk
                </Link>

                {/* Form Header */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            ChemTalk Publication Studio
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Publish Chemical Thesis or Article
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Author: <strong className="text-slate-800">{currentUser.fullName || currentUser.username}</strong>
                        {currentUser.affiliation && ` (${currentUser.affiliation})`}
                    </p>
                </div>

                {/* Publication Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Step 1: Contribution Type */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                        <h3 className="font-extrabold text-slate-900 text-base">1. Contribution Type</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                {
                                    id: "thesis",
                                    label: "Chemical Thesis",
                                    desc: "Academic dissertation, PhD/MSc thesis excerpt, or lab research paper",
                                    icon: GraduationCap,
                                },
                                {
                                    id: "article",
                                    label: "Industry Article",
                                    desc: "Market whitepaper, chemical enterprise analysis, technology trends",
                                    icon: FileText,
                                },
                                {
                                    id: "case-study",
                                    label: "Plant Case Study",
                                    desc: "Process troubleshooting, optimization, plant safety reports",
                                    icon: Building,
                                },
                                {
                                    id: "discussion",
                                    label: "Public Talk",
                                    desc: "Open question, hypothesis debate, technical sub-topic thread",
                                    icon: MessageSquare,
                                },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isSelected = formData.type === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, type: item.id }))}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                                            isSelected
                                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                : "border-slate-100 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Icon className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-xs sm:text-sm ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                                                {item.label}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Metadata */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                        <h3 className="font-extrabold text-slate-900 text-base">2. Publication Details</h3>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Publication Title *</label>
                            <input
                                type="text"
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Synthesis of Bio-Based Polyurethane from Nigerian Palm Oil: Kinetics and Performance"
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Chemical Domain / Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white cursor-pointer"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Keywords & Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g. polymers, catalysis, palm-oil, bio-diesel (comma-separated)"
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                <span>Thesis Abstract / Executive Summary</span>
                                <span className="text-[11px] font-normal text-slate-400">Recommended for theses & research</span>
                            </label>
                            <textarea
                                rows={4}
                                name="abstract"
                                value={formData.abstract}
                                onChange={handleChange}
                                placeholder="Provide a concise 150-300 word summary covering research objectives, methodology, key chemical observations, and industrial significance."
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm leading-relaxed focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                        </div>
                    </div>

                    {/* Step 3: Full Paper Content */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-900 text-base">3. Full Body Content *</h3>
                            <span className="text-xs text-slate-400">Supports headers, equations, images, quotes</span>
                        </div>
                        <RichTextEditor
                            value={formData.content}
                            onChange={handleContentChange}
                            placeholder="Write your research paper, methodology, results, discussion, or thesis excerpt here..."
                        />
                    </div>

                    {/* Step 4: Media & Attachments */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                        <h3 className="font-extrabold text-slate-900 text-base">4. Visuals & Document Attachment (Optional)</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Cover Image */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Featured Cover Image</label>
                                {formData.coverImage ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video">
                                        <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all">
                                        <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                                        {uploadingImage ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                                                <span className="text-xs font-bold text-slate-700">Upload Cover Image</span>
                                                <span className="text-[11px] text-slate-400">PNG, JPG or WEBP</span>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>

                            {/* Full Thesis PDF Attachment */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Full Thesis / Dissertation PDF (Optional)</label>
                                {formData.attachmentUrl ? (
                                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <span className="text-xs font-bold text-emerald-900 truncate">
                                                {formData.attachmentName || "Attached Research Document"}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, attachmentUrl: "", attachmentName: "" }))}
                                            className="p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all">
                                        <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={handlePdfUpload} />
                                        {uploadingPdf ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                        ) : (
                                            <>
                                                <FileUp className="w-6 h-6 text-slate-400 mb-1.5" />
                                                <span className="text-xs font-bold text-slate-700">Upload Full PDF / Paper</span>
                                                <span className="text-[11px] text-slate-400">PDF, DOC up to 50MB</span>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Link
                            href="/chemtalk"
                            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl hover:shadow-blue-600/25 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {submitting ? "Publishing to ChemTalk..." : "Publish to Community Agora"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
