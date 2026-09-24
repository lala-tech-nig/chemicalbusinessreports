"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { fetchSinglePost, fetchApprovedComments, createComment, fetchActiveAds, API_URL } from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import InFeedAd from "@/components/InFeedAd";
import VoicePlayer from "@/components/VoicePlayer";
import SocialShareBar from "@/components/SocialShareBar";
import CommentSection from "@/components/CommentSection";

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

export default function SinglePostClient({ slug, initialPost = null }) {
    const [post, setPost] = useState(initialPost);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(!initialPost);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const loadContent = async () => {
            try {
                const [postData, adsData] = await Promise.all([
                    initialPost ? Promise.resolve(initialPost) : fetchSinglePost(slug),
                    fetchActiveAds()
                ]);

                setPost(postData);
                setAds(adsData);

                if (postData && postData._id) {
                    const commentsData = await fetchApprovedComments(postData._id);
                    setComments(commentsData);

                    // Track post view interaction (for analytics & client readership alerts)
                    try {
                        const { getOrCreateSessionId } = await import("@/hooks/useAnalytics");
                        // Dispatch via fetch so it's reliable
                        let sid = typeof window !== "undefined" ? sessionStorage.getItem("cbr_sid") : null;
                        if (!sid && typeof window !== "undefined") {
                            sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
                            sessionStorage.setItem("cbr_sid", sid);
                        }

                        fetch(`${API_URL}/analytics/track`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                sessionId: sid,
                                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
                                event: {
                                    type: "post_interaction",
                                    payload: {
                                        postSlug: postData.slug || slug,
                                        postTitle: postData.title,
                                        action: "view"
                                    }
                                }
                            }),
                            keepalive: true
                        }).catch(() => {});
                    } catch (trackErr) {
                        // ignore
                    }
                }
            } catch (err) {
                console.error("Failed to fetch content:", err);
                setError("Post not found");
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [slug, initialPost]);

    const refreshComments = async () => {
        if (post && post._id) {
            try {
                const data = await fetchApprovedComments(post._id);
                setComments(data);
            } catch (err) {
                console.error("Failed to refresh comments:", err);
            }
        }
    };

    // Helper to inject ads and paragraph images into content
    const contentWithAds = useMemo(() => {
        if (!post?.content) return [];
        
        const hasAdPlacements = Array.isArray(post.adPlacements) && post.adPlacements.length > 0;
        const hasParagraphImages = Array.isArray(post.paragraphImages) && post.paragraphImages.length > 0;

        if (!hasAdPlacements && !hasParagraphImages) {
            return [{ type: 'content', data: post.content }];
        }

        const paragraphs = post.content.split('</p>').filter(p => p.trim() !== '').map(p => p + '</p>');
        const result = [];

        paragraphs.forEach((p, index) => {
            result.push({ type: 'content', data: p });
            
            // Check for paragraph image
            if (hasParagraphImages) {
                const imgPlacement = post.paragraphImages.find(img => img.paragraphIndex === index);
                if (imgPlacement && imgPlacement.imageUrl) {
                    result.push({ type: 'paragraphImage', data: imgPlacement });
                }
            }

            // Check for ad placement
            if (hasAdPlacements) {
                const placement = post.adPlacements.find(apl => apl.paragraphIndex === index);
                if (placement) {
                    const ad = ads.find(a => a._id === placement.adId);
                    if (ad) {
                        result.push({ type: 'ad', data: ad });
                    }
                }
            }
        });

        return result;
    }, [post?.content, post?.adPlacements, post?.paragraphImages, ads]);

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
                <h1 className="text-2xl font-bold">Post not found</h1>
                <Link href="/posts" className="text-primary hover:underline flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Posts
                </Link>
            </div>
        );
    }

    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": post.title,
        "description": post.excerpt || post.title,
        "image": post.image ? [post.image] : [],
        "datePublished": post.createdAt || post.date,
        "dateModified": post.updatedAt || post.createdAt || post.date,
        "author": [{
            "@type": "Person",
            "name": post.author || "Admin"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Chemical Business Reports",
            "logo": {
                "@type": "ImageObject",
                "url": "https://chemicalbusinessreports.com/favicon.ico"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://chemicalbusinessreports.com/posts/${slug}`
        },
        "keywords": `${post.category}, chemical business report, chemical business reports, chemical market intelligence, ${post.title}`
    };

    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#fafafa]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Column */}
                    <article className="lg:col-span-8">
                        <Link href={getCategoryRoute(post.category)} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to {post.category || "Posts"}
                        </Link>

                        <header className="mb-8">
                            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                {post.category}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-between text-muted-foreground gap-4 text-sm pb-6 border-b border-gray-200">
                                <div className="flex flex-wrap items-center gap-6">
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
                                        {new Date(post.createdAt || post.date).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Top Social Share Bar */}
                                <SocialShareBar post={post} />
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
                        <div className="relative w-full rounded-2xl overflow-hidden mb-10 shadow-lg bg-white border border-gray-100" style={{ minHeight: "300px", maxHeight: "600px" }}>
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
                                        alt={post.title}
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
                        {post.excerpt && (
                            <div
                                className="rounded-2xl p-6 md:p-8 border border-border shadow-sm mb-10 relative overflow-hidden group"
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
                            <div className="mb-12 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                                <div className={`relative overflow-hidden transition-all duration-500 ${!expanded ? "max-h-[800px]" : "max-h-none"}`}>
                                    <div className="prose prose-lg prose-slate max-w-none dark:prose-invert text-gray-950">
                                        {Array.isArray(contentWithAds) ? (
                                            contentWithAds.map((item, index) => (
                                                <Fragment key={index}>
                                                    {item.type === 'content' ? (
                                                        <div dangerouslySetInnerHTML={{ __html: item.data }} />
                                                    ) : item.type === 'paragraphImage' ? (
                                                        <figure className="my-8 not-prose">
                                                            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-50 transition-all duration-300 hover:shadow-xl">
                                                                <img
                                                                    src={item.data.imageUrl}
                                                                    alt={post.title ? `${post.title} paragraph illustration` : "Article paragraph image"}
                                                                    className="w-full h-auto max-h-[620px] object-cover mx-auto block"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        </figure>
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

                        {/* Bottom Social Share Bar Box */}
                        <div className="mb-16 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-extrabold text-base text-gray-900">Found this article insightful?</h3>
                                <p className="text-xs text-gray-500">Share with your chemical industry colleagues and network</p>
                            </div>
                            <SocialShareBar post={post} />
                        </div>

                        {/* Comments Section */}
                        {/* Threaded Comments Section */}
                        <CommentSection
                            postId={post._id}
                            comments={comments}
                            onCommentSubmitted={refreshComments}
                        />
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
