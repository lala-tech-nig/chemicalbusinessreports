"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Loader2, Share2, ChevronDown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { fetchActiveAds } from "@/lib/api";
import { toast } from "sonner";
import InFeedAd from "@/components/InFeedAd";
import VoicePlayer from "@/components/VoicePlayer";

const CATEGORY_ROUTES = {
    "News Roundup": "/posts/news-roundup",
    "Chemical Mart": "/posts/chemical-mart",
    "Research & Reports": "/posts/research-reports",
    "Corporate Profile": "/posts/corporate-profile",
    "START UP": "/posts/startup",
    "Executive Brief": "/posts/executive-brief",
};

function getCategoryRoute(category) {
    return CATEGORY_ROUTES[category] || "/posts";
}

export default function PreviewPostPage() {
    const [post, setPost] = useState(null);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const adsData = await fetchActiveAds();
                setAds(adsData);

                const previewData = localStorage.getItem("postPreviewData");
                if (previewData) {
                    setPost(JSON.parse(previewData));
                } else {
                    setError("No preview data found.");
                }
            } catch (err) {
                console.error("Failed to load preview:", err);
                setError("Failed to load preview content");
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, []);

    const handleShare = () => {
        toast.info("Sharing is disabled in preview mode.");
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        toast.info("Commenting is disabled in preview mode.");
    };

    // Helper to inject ads into content
    const contentWithAds = useMemo(() => {
        if (!post?.content) return [];
        
        // Split by </p> but preserve the content
        const paragraphs = post.content.split('</p>').filter(p => p.trim() !== '').map(p => p + '</p>');
        const result = [];
        
        // If there are no manual placements, just return the content as one chunk
        if (!post.adPlacements || post.adPlacements.length === 0) {
            return [{ type: 'content', data: post.content }];
        }

        paragraphs.forEach((p, index) => {
            result.push({ type: 'content', data: p });
            
            // Check if there's a manual ad placement after this paragraph
            const placement = post.adPlacements.find(apl => apl.paragraphIndex === index);
            if (placement) {
                // Find the ad in the ads array (fetched separately)
                const ad = ads.find(a => a._id === placement.adId);
                if (ad) {
                    result.push({ type: 'ad', data: ad });
                }
            }
        });

        return result;
    }, [post?.content, post?.adPlacements, ads]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mb-2" />
                <h1 className="text-2xl font-bold">{error || "No preview data found"}</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    Please go back to the editor and click the Preview button again to load the preview data.
                </p>
                <button onClick={() => window.close()} className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                    Close Preview
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#fafafa]">
            <div className="fixed top-0 left-0 w-full bg-yellow-400 text-yellow-900 text-center py-2 font-bold z-50 shadow-md flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                PREVIEW MODE - This post is not published yet
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Column */}
                    <article className="lg:col-span-8">
                        <Link href={getCategoryRoute(post.category)} onClick={(e) => e.preventDefault()} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group cursor-default">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to {post.category || "Posts"}
                        </Link>

                        <header className="mb-10">
                            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                {post.category || "Uncategorized"}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                                {post.title || "Untitled Post"}
                            </h1>

                            <div className="flex flex-wrap items-center text-muted-foreground gap-6 text-sm">
                                <div className="flex items-center">
                                    {post.authorPhoto ? (
                                        <div className="relative w-10 h-10 mr-3 border-2 border-white shadow-sm rounded-full overflow-hidden">
                                            <img
                                                src={post.authorPhoto}
                                                alt={post.author}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 mr-3 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-bold leading-tight">{post.author || "Admin"}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Author</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date().toLocaleDateString()}
                                </div>
                                <button onClick={handleShare} className="flex items-center hover:text-primary transition-colors opacity-50 cursor-not-allowed">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </button>
                            </div>
                        </header>

                        {/* Voice Narration Player */}
                        <VoicePlayer
                            title={post.title}
                            excerpt={post.excerpt}
                            content={post.content}
                            className="mb-10"
                        />

                        {/* Featured Image */}
                        <div className="relative w-full rounded-2xl overflow-hidden mb-12 shadow-lg bg-white border border-gray-100" style={{ minHeight: "300px", maxHeight: "600px" }}>
                            {post.image ? (
                                post.image.match(/\.(mp4|webm|mov)$/i) ? (
                                    <video
                                        src={post.image}
                                        className="w-full h-full object-contain"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        controls
                                    />
                                ) : (
                                    <Image
                                        src={post.image}
                                        alt={post.title || "Preview"}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground min-h-[300px]">
                                    No Image Available
                                </div>
                            )}
                        </div>

                        {/* Summary / Excerpt Section */}
                        {(post.excerpt) && (
                            <div
                                className="rounded-2xl p-6 md:p-8 border border-border shadow-sm mb-12 relative overflow-hidden group"
                                style={{
                                    backgroundColor: post.excerptColor && post.excerptColor !== '#FFFF00' ? post.excerptColor : '#fefce8',
                                }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-800/60 bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                        Excerpt / Summary
                                    </span>
                                </div>
                                <p 
                                    className="text-lg md:text-xl leading-relaxed font-semibold italic relative z-10"
                                    style={{ color: post.excerptTextColor || '#111827' }}
                                >
                                    "{post.excerpt}"
                                </p>
                            </div>
                        )}

                        {/* Full article content */}
                        {post.content && (
                            <div className="mb-16 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                                <div className={`relative overflow-hidden transition-all duration-500 ${!expanded ? "max-h-[800px]" : "max-h-none"}`}>
                                    <div className="prose prose-lg prose-slate max-w-none dark:prose-invert text-gray-950">
                                        {Array.isArray(contentWithAds) ? (
                                            contentWithAds.map((item, index) => (
                                                <Fragment key={index}>
                                                    {item.type === 'content' ? (
                                                        <div dangerouslySetInnerHTML={{ __html: item.data }} className="[&>p]:mb-4" />
                                                    ) : (
                                                        <div className="my-10 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 not-prose">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Sponsored Content</p>
                                                            <InFeedAd ad={item.data} className="max-w-2xl mx-auto shadow-none" />
                                                        </div>
                                                    )}
                                                </Fragment>
                                            ))
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                        )}
                                    </div>

                                    {!expanded && (
                                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                    )}
                                </div>

                                {!expanded && (
                                    <div className="flex justify-center mt-8">
                                        <button
                                            onClick={() => setExpanded(true)}
                                            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-xl hover:bg-primary/90 hover:scale-105 transition-all duration-200"
                                        >
                                            Continue Reading
                                            <ChevronDown className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="border-t border-gray-200 pt-16 opacity-50 pointer-events-none">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-black text-gray-900">Conversations <span className="text-gray-400 font-normal">(0)</span></h2>
                            </div>

                            <form onSubmit={handleCommentSubmit} className="mb-16 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold mb-6">Join the discussion</h3>
                                <div className="grid grid-cols-1 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            disabled
                                            placeholder="eg. John Doe"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Message</label>
                                        <textarea
                                            disabled
                                            rows="4"
                                            placeholder="Commenting is disabled in preview mode."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled
                                    className="w-full md:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20"
                                >
                                    Post Comment
                                </button>
                            </form>
                        </div>
                    </article>

                    {/* Sidebar Column */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-24 space-y-8">
                            {ads.length > 0 ? (
                                ads.slice(0, 3).map((ad, idx) => (
                                    <div key={ad._id || idx} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Advertisement</p>
                                        <InFeedAd ad={ad} className="shadow-none border-0" />
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Advertisement</p>
                                    <div className="bg-gray-50 aspect-square rounded-2xl flex items-center justify-center border border-dashed border-gray-200 p-8 text-center">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Space available for <br />Advertisement</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
