"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Upload, Plus, X } from "lucide-react";
import { uploadFile, createExecutiveProfile } from "@/lib/api";

export default function ExecutiveProfileForm() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        fullName: "",
        professionalTitle: "",
        company: "",
        industry: "",
        location: "",
        headshot: "",
        summary: "",
        degrees: "",
        professionalTraining: "",
        careerJourney: "",
        yearsOfExperience: "",
        expertise: [],
        majorRoles: "",
        achievements: "",
        opportunities: "",
        challenges: "",
        leadershipPhilosophy: "",
        mentorshipDetails: "",
        entrepreneurshipDetails: "",
        memberships: "",
        communityEngagement: "",
        longTermVision: "",
        personalInterests: "",
        finalMessage: "",
        isConfirmed: false
    });

    const [expertiseInput, setExpertiseInput] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleExpertiseAdd = () => {
        if (expertiseInput.trim()) {
            setFormData(prev => ({
                ...prev,
                expertise: [...prev.expertise, expertiseInput.trim()]
            }));
            setExpertiseInput("");
        }
    };

    const removeExpertise = (index) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.filter((_, i) => i !== index)
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await uploadFile(file);
            setFormData(prev => ({ ...prev, headshot: result.url }));
        } catch (err) {
            setError("Failed to upload image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.isConfirmed) {
            setError("Please confirm the information is accurate.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await createExecutiveProfile(formData);
            setSubmitted(true);
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-muted/30">
                <div className="max-w-xl w-full bg-card p-12 rounded-3xl border border-border flex flex-col items-center text-center shadow-2xl">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Success!</h2>
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        Thank you for participating in our Executive Leadership Profile series. Your submission has been received and our editorial team will review it shortly.
                    </p>
                    <button 
                        onClick={() => window.location.href = "/"}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                    >
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 bg-muted/20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Executive Profile Submission Form</h1>
                    <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-left">
                        <p className="text-lg text-muted-foreground leading-relaxed italic mb-4">
                            (For Leadership Feature Articles)
                        </p>
                        <p className="text-lg text-foreground/90 leading-relaxed mb-4">
                            Thank you for participating in our Executive Leadership Profile series.
                        </p>
                        <p className="text-lg text-foreground/90 leading-relaxed mb-4">
                            This form collects information that will be used to create a professionally written executive feature article highlighting your career, leadership journey, expertise, and industry impact.
                        </p>
                        <p className="text-lg text-foreground/90 leading-relaxed">
                            Please provide clear and detailed responses where possible. Our editorial team will use this information to craft a polished leadership profile for publication.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1 */}
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Professional Title / Current Role</label>
                                <input required type="text" name="professionalTitle" value={formData.professionalTitle} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Company / Organization</label>
                                <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Industry / Sector</label>
                                <input required type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">City & Country of Operation</label>
                                <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Professional Headshot</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 cursor-pointer bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/20 rounded-xl p-3 text-center transition-colors">
                                        <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                                        <div className="flex items-center justify-center gap-2 text-primary font-medium">
                                            <Upload className="w-4 h-4" />
                                            {formData.headshot ? "Change Photo" : "Upload Headshot"}
                                        </div>
                                    </label>
                                    {formData.headshot && (
                                        <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                                            <img src={formData.headshot} alt="Headshot" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                            Executive Summary
                        </h3>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">How would you describe yourself professionally in 2–3 sentences?</label>
                            <p className="text-xs text-muted-foreground italic mb-2">Example: A chemical engineer with over 20 years of experience in industrial manufacturing and product innovation.</p>
                            <textarea required name="summary" value={formData.summary} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px]" placeholder="Your summary..."></textarea>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                            Educational Background
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Primary Degree(s)</label>
                                <p className="text-xs text-muted-foreground italic mb-2">Example: BSc Chemical Engineering — University of Lagos, MSc Industrial Chemistry — University of Ibadan</p>
                                <textarea name="degrees" value={formData.degrees} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]" placeholder="List degrees..."></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Other Professional Training or Executive Programs</label>
                                <textarea name="professionalTraining" value={formData.professionalTraining} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]" placeholder="Leadership programs, certifications..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">4</span>
                            Career Journey
                        </h3>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Describe your professional journey and how you entered your industry.</label>
                            <p className="text-xs text-muted-foreground italic mb-2">Prompt: What inspired your career path, and how has your journey evolved over the years?</p>
                            <textarea name="careerJourney" value={formData.careerJourney} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[150px]" placeholder="Your story..."></textarea>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">5</span>
                            Professional Experience
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Years of Experience</label>
                                    <input type="text" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. 15+" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Key Areas of Expertise</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleExpertiseAdd())} className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 outline-none" placeholder="Add expertise..." />
                                        <button type="button" onClick={handleExpertiseAdd} className="bg-primary text-primary-foreground p-3 rounded-xl"><Plus className="w-5 h-5"/></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.expertise.map((item, idx) => (
                                            <span key={idx} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
                                                {item}
                                                <X onClick={() => removeExpertise(idx)} className="w-3 h-3 cursor-pointer" />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Major Roles or Positions Held</label>
                                <textarea name="majorRoles" value={formData.majorRoles} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]" placeholder="List companies and roles..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Sections 6-15 simplified grid */}
                    <div className="grid grid-cols-1 gap-8">
                        {[
                            { id: 6, label: "Key Achievements and Contributions", name: "achievements", placeholder: "Developed new products, led innovation..." },
                            { id: 7, label: "Industry Insight - Opportunities", name: "opportunities", placeholder: "What are the biggest opportunities?" },
                            { id: 7.1, label: "Industry Insight - Challenges", name: "challenges", placeholder: "What are the biggest challenges?" },
                            { id: 8, label: "Leadership Philosophy", name: "leadershipPhilosophy", placeholder: "Your values and principles..." },
                            { id: 9, label: "Mentorship and Impact", name: "mentorshipDetails", placeholder: "Do you mentor or support development?" },
                            { id: 10, label: "Entrepreneurship or Initiatives", name: "entrepreneurshipDetails", placeholder: "Founded businesses or projects?" },
                            { id: 11, label: "Professional Memberships & Certifications", name: "memberships", placeholder: "Chartered institutes, fellowships..." },
                            { id: 12, label: "Community Engagement", name: "communityEngagement", placeholder: "Service, advocacy, social initiatives..." },
                            { id: 13, label: "Vision for the Future", name: "longTermVision", placeholder: "Next 5-10 years..." },
                            { id: 14, label: "Personal Insights (Optional)", name: "personalInterests", placeholder: "Interests outside work..." },
                            { id: 15, label: "Final Message", name: "finalMessage", placeholder: "Message for the next generation..." },
                        ].map(section => (
                            <div key={section.name} className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">{section.id}</span>
                                    {section.label}
                                </h3>
                                <textarea name={section.name} value={formData[section.name]} onChange={handleChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px]" placeholder={section.placeholder}></textarea>
                            </div>
                        ))}
                    </div>

                    {/* Final Confirmation */}
                    <div className="bg-card border-2 border-primary/20 rounded-3xl p-8 shadow-sm">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <input type="checkbox" name="isConfirmed" checked={formData.isConfirmed} onChange={handleChange} className="mt-1.5 w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                            <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                I confirm that the information provided is accurate and can be used for editorial publication.
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-8">
                        <button 
                            disabled={loading}
                            type="submit"
                            className="bg-primary text-primary-foreground px-12 py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : null}
                            Submit Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
