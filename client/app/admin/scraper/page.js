"use client";

import { useState, useEffect } from "react";
import { Settings, Play, List, Globe, Trash2, Edit, Loader2 } from "lucide-react";
import { getScraperConfig, updateScraperConfig, runScraper, fetchScraperDrafts, deletePost } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function ScraperManagement() {
    const { user } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("drafts");
    const [loading, setLoading] = useState(true);

    // Config State
    const [config, setConfig] = useState({ targetUrls: [], keywords: [], lastRun: null });
    const [urlsInput, setUrlsInput] = useState("");
    const [keywordsInput, setKeywordsInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // Drafts State
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
        if (user.role === 'moderator') {
            router.push('/admin'); // Prevent moderators
            return;
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [configData, draftsData] = await Promise.all([
                getScraperConfig(),
                fetchScraperDrafts()
            ]);

            setConfig(configData);
            setUrlsInput(configData.targetUrls.join('\n'));
            setKeywordsInput(configData.keywords.join(', '));
            setDrafts(draftsData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load scraper data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            const newUrls = urlsInput.split('\n').map(u => u.trim()).filter(u => u);
            const newKeywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);

            await updateScraperConfig({ targetUrls: newUrls, keywords: newKeywords });
            toast.success("Configuration saved successfully");
            loadData(); // refresh
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRunScraper = async () => {
        setIsRunning(true);
        toast.info("Scraper started in background...");
        try {
            const res = await runScraper();
            toast.success(`Scraper finished. Found ${res.newDrafts} new drafts!`);
            loadData(); // refresh drafts
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsRunning(false);
        }
    };

    const handleDeleteDraft = async (id) => {
        if (!confirm("Are you sure you want to delete this drafted post?")) return;
        try {
            await deletePost(id); // assuming deletePost exists in api.js
            setDrafts(drafts.filter(d => d._id !== id));
            toast.success("Draft deleted");
        } catch (error) {
            toast.error("Failed to delete draft");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Globe className="w-8 h-8" /> Auto Scraper
                    </h1>
                    <p className="text-muted-foreground mt-1">Automatically extract news articles from target URLs.</p>
                </div>

                <button
                    onClick={handleRunScraper}
                    disabled={isRunning}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    {isRunning ? "Running Scraper..." : "Run Scraper Now"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-muted/50 p-1 rounded-xl w-max border border-border">
                <button
                    onClick={() => setActiveTab('drafts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'drafts' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <List className="w-4 h-4" /> Review Drafts ({drafts.length})
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'config' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Settings className="w-4 h-4" /> Configuration
                </button>
            </div>

            {/* Content */}
            {activeTab === 'config' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold">Target URLs</h2>
                        <p className="text-sm text-muted-foreground">Enter one URL per line. The scraper will visit these sites to look for news.</p>
                        <textarea
                            className="w-full h-64 px-4 py-3 rounded-lg border border-input bg-background font-mono text-sm leading-relaxed"
                            value={urlsInput}
                            onChange={(e) => setUrlsInput(e.target.value)}
                            placeholder="https://example.com/news\nhttps://anothersite.com/blog"
                        />
                    </div>

                    <div className="space-y-8">
                        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
                            <h2 className="text-xl font-semibold">Keywords</h2>
                            <p className="text-sm text-muted-foreground">Enter keywords separated by commas. Only articles containing these keywords in their title will be saved.</p>
                            <textarea
                                className="w-full h-32 px-4 py-3 rounded-lg border border-input bg-background text-sm leading-relaxed"
                                value={keywordsInput}
                                onChange={(e) => setKeywordsInput(e.target.value)}
                                placeholder="merger, acquisition, capacity, BASF, Dow"
                            />
                        </div>

                        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col items-start gap-4">
                            <div>
                                <h3 className="font-semibold">Cron Job Status</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    The automatic scraper runs every 6 hours in the background.
                                    <br />
                                    Last Run: {config.lastRun ? new Date(config.lastRun).toLocaleString() : "Never"}
                                </p>
                            </div>
                            <button
                                onClick={handleSaveConfig}
                                disabled={isSaving}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    {drafts.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <List className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No pending drafts</h3>
                            <p className="text-muted-foreground mt-1">There are currently no new articles scraped. Run the scraper or wait for the next scheduled job.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Source URL</th>
                                    <th className="px-6 py-4">Scraped On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {drafts.map((draft) => (
                                    <tr key={draft._id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-6 py-4 font-medium max-w-xs truncate" title={draft.title}>
                                            {draft.title}
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px] truncate">
                                            <a href={draft.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                {draft.sourceUrl}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(draft.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/posts/${draft._id}`}
                                                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-medium"
                                                >
                                                    <Edit className="w-4 h-4" /> Review
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteDraft(draft._id)}
                                                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                    title="Delete Draft"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
