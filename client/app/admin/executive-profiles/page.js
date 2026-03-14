"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye, Download, X, Calendar, MapPin, Briefcase, GraduationCap, Award, Lightbulb, Users as UsersIcon, Heart, Rocket, MessageSquare, CheckCircle } from "lucide-react";
import { fetchExecutiveProfiles } from "@/lib/api";

export default function AdminExecutiveProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchExecutiveProfiles();
            setProfiles(data);
        } catch (error) {
            console.error("Failed to load profiles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Full Name,Title,Company,Industry,Location,Date\n"
            + profiles.map(p => `"${p.fullName}","${p.professionalTitle}","${p.company}","${p.industry}","${p.location}","${new Date(p.createdAt).toLocaleDateString()}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "executive_profiles.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Executive Profiles</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and review executive leadership feature submissions.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Executive</th>
                                <th className="px-6 py-4">Title & Company</th>
                                <th className="px-6 py-4">Industry</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {profiles.map((profile) => (
                                <tr key={profile._id} className="hover:bg-accent/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex-shrink-0">
                                                {profile.headshot ? (
                                                    <img src={profile.headshot} alt={profile.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold">{profile.fullName[0]}</div>
                                                )}
                                            </div>
                                            <span className="font-bold text-foreground text-sm">{profile.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{profile.professionalTitle}</span>
                                            <span className="text-xs text-muted-foreground">{profile.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{profile.industry}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{profile.location}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedProfile(profile)}
                                            className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all border border-primary/10"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {profiles.length === 0 && (
                    <div className="p-20 flex flex-col items-center justify-center text-muted-foreground text-center">
                        <UsersIcon className="w-16 h-16 mb-6 opacity-10" />
                        <h3 className="text-xl font-bold text-foreground">No profiles found</h3>
                        <p className="max-w-xs mt-2 font-medium opacity-60">Wait for executives to submit their profiles via the website form.</p>
                    </div>
                )}
            </div>

            {/* Profile Detail Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-6xl max-h-full overflow-y-auto rounded-3xl border border-border shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md px-8 py-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden shrink-0">
                                    {selectedProfile.headshot ? (
                                        <img src={selectedProfile.headshot} alt={selectedProfile.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">{selectedProfile.fullName[0]}</div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight">{selectedProfile.fullName}</h2>
                                    <p className="text-muted-foreground font-medium text-sm">{selectedProfile.professionalTitle} at {selectedProfile.company}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedProfile(null)}
                                className="p-3 rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 md:p-12 space-y-12">
                            {/* Executive Summary */}
                            <section className="bg-muted/30 p-8 rounded-3xl border border-border/50">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-primary uppercase tracking-widest text-xs">
                                    <MessageSquare className="w-4 h-4" />
                                    Executive Summary
                                </h3>
                                <p className="text-xl font-medium leading-relaxed italic text-foreground/90">"{selectedProfile.summary}"</p>
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Column */}
                                <div className="lg:col-span-2 space-y-12">
                                    <Section 
                                        icon={<GraduationCap className="w-5 h-5" />} 
                                        title="Educational Background" 
                                        subSections={[
                                            { label: "Primary Degree(s)", content: selectedProfile.degrees },
                                            { label: "Other Professional Training", content: selectedProfile.professionalTraining }
                                        ]} 
                                    />
                                    <Section 
                                        icon={<Rocket className="w-5 h-5" />} 
                                        title="Career Journey" 
                                        content={selectedProfile.careerJourney} 
                                    />
                                    <Section 
                                        icon={<Briefcase className="w-5 h-5" />} 
                                        title="Professional Experience" 
                                        content={selectedProfile.majorRoles}
                                        meta={`Years of experience: ${selectedProfile.yearsOfExperience}`}
                                        tags={selectedProfile.expertise}
                                    />
                                    <Section 
                                        icon={<Award className="w-5 h-5" />} 
                                        title="Key Achievements" 
                                        content={selectedProfile.achievements} 
                                    />
                                </div>

                                {/* Right Column */}
                                <div className="space-y-10">
                                    <MiniSection icon={<Lightbulb className="w-4 h-4" />} title="Industry Insights" items={[
                                        { label: "Opportunities", content: selectedProfile.opportunities },
                                        { label: "Challenges", content: selectedProfile.challenges }
                                    ]} />
                                    <MiniSection icon={<UsersIcon className="w-4 h-4" />} title="Leadership & Mentorship" items={[
                                        { label: "Philosophy", content: selectedProfile.leadershipPhilosophy },
                                        { label: "Mentorship", content: selectedProfile.mentorshipDetails }
                                    ]} />
                                    <MiniSection icon={<Heart className="w-4 h-4" />} title="Impact & Vision" items={[
                                        { label: "Entrepreneurship", content: selectedProfile.entrepreneurshipDetails },
                                        { label: "Vision", content: selectedProfile.longTermVision },
                                        { label: "Community", content: selectedProfile.communityEngagement }
                                    ]} />
                                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                        <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3"/>
                                            Confirmation
                                        </h4>
                                        <p className="text-sm font-medium text-foreground/80">
                                            The executive has confirmed that this information is accurate for editorial publication.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Final Message */}
                            <section className="border-t border-border pt-12">
                                <div className="max-w-3xl mx-auto text-center space-y-4">
                                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Final Message to Next Gen</h4>
                                    <p className="text-2xl font-extrabold text-foreground leading-tight tracking-tight">"{selectedProfile.finalMessage}"</p>
                                    {selectedProfile.personalInterests && (
                                        <div className="pt-8">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Personal Interests</span>
                                            <p className="text-muted-foreground italic">{selectedProfile.personalInterests}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ icon, title, content, subSections, meta, tags }) {
    return (
        <section className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="p-2 rounded-lg bg-primary/10 border border-primary/20">{icon}</span>
                {title}
            </h3>
            <div className="pl-12 space-y-6">
                {meta && <p className="text-sm font-bold text-muted-foreground bg-muted w-fit px-3 py-1 rounded-full">{meta}</p>}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((t, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-[10px] font-bold uppercase">{t}</span>)}
                    </div>
                )}
                {content && <p className="text-foreground/80 leading-relaxed font-medium">{content}</p>}
                {subSections && subSections.map((s, i) => (
                    <div key={i} className="space-y-1">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</h4>
                        <p className="text-foreground/80 leading-relaxed font-medium">{s.content || "N/A"}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function MiniSection({ icon, title, items }) {
    return (
        <div className="space-y-6 border-l-2 border-primary/10 pl-6">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-3">
                <span className="text-primary">{icon}</span>
                {title}
            </h3>
            <div className="space-y-6">
                {items.map((item, i) => (
                    <div key={i} className="space-y-2">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</h4>
                        <p className="text-sm leading-relaxed font-medium text-foreground/80 bg-muted/40 p-4 rounded-xl border border-border/50">{item.content || "N/A"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
