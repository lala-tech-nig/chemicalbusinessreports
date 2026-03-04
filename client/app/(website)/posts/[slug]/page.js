"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Loader2, Share2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { fetchSinglePost, fetchApprovedComments, createComment, fetchActiveAds } from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import InFeedAd from "@/components/InFeedAd";

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

export default function SinglePostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentForm, setCommentForm] = useState({ authorName: "", content: "" });
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const loadContent = async () => {
            try {
                const [postData, adsData] = await Promise.all([
                    fetchSinglePost(slug),
                    fetchActiveAds()
                ]);

                setPost(postData);
                setAds(adsData);

                if (postData && postData._id) {
                    const commentsData = await fetchApprovedComments(postData._id);
                    setComments(commentsData);
                }
            } catch (err) {
                console.error("Failed to fetch content:", err);
                setError("Post not found");
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [slug]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: "Check out this article on Chemical Business Reports",
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!post || !post._id) return;
        setSubmitting(true);
        try {
            await createComment({ ...commentForm, postId: post._id });
            toast.success("Comment submitted for moderation. It will appear after approval.");
            setCommentForm({ authorName: "", content: "" });
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.7 }
            });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to inject ads into content
    const contentWithAds = useMemo(() => {
        if (!post?.content || ads.length === 0) return post?.content;

        const ad = ads[0]; // Use first ad for in-content
        const paragraphs = post.content.split(/<\/p>/);

        if (paragraphs.length > 3) {
            // Insert ad after 2nd paragraph
            const firstPart = paragraphs.slice(0, 2).join('</p>') + '</p>';
            const secondPart = paragraphs.slice(2).join('</p>');

            // Create ad HTML (using a placeholder that we'll replace or just render directly if possible)
            // Since we use dangerouslySetInnerHTML, we can't easily inject a React component directly into the string.
            // Instead, we split the rendering.
            return {
                parts: [firstPart, secondPart],
                ad: ad
            };
        }
        return { parts: [post.content], ad: null };
    }, [post?.content, ads]);

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

    const isNewsRoundup = post.category === "News Roundup";
    const sidebarAd = ads.length > 1 ? ads[1] : (ads.length > 0 ? ads[0] : null);

    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Column */}
                    <article className="lg:col-span-8">
                        <Link href={getCategoryRoute(post.category)} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to {post.category || "Posts"}
                        </Link>

                        <header className="mb-10">
                            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                {post.category}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center text-muted-foreground gap-6 text-sm">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    {post.author || "Admin"}
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(post.createdAt || post.date).toLocaleDateString()}
                                </div>
                                <button onClick={handleShare} className="flex items-center hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </button>
                            </div>
                        </header>

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
                                        Executive Brief
                                    </span>
                                </div>
                                <p className="text-gray-900 text-lg md:text-xl leading-relaxed font-semibold italic relative z-10">
                                    "{post.excerpt}"
                                </p>
                            </div>
                        )}

                        {/* Full article content */}
                        {post.content && (
                            <div className="mb-16 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                                <div className={`relative overflow-hidden transition-all duration-500 ${!expanded ? "max-h-[800px]" : "max-h-none"}`}>
                                    {typeof contentWithAds === 'object' && contentWithAds.parts ? (
                                        <>
                                            <div
                                                className="prose prose-lg prose-gray max-w-none dark:prose-invert"
                                                dangerouslySetInnerHTML={{ __html: contentWithAds.parts[0] }}
                                            />
                                            {contentWithAds.ad && (
                                                <div className="my-10 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Sponsored Content</p>
                                                    <InFeedAd ad={contentWithAds.ad} className="max-w-2xl mx-auto shadow-none" />
                                                </div>
                                            )}
                                            {contentWithAds.parts[1] && (
                                                <div
                                                    className="prose prose-lg prose-gray max-w-none dark:prose-invert"
                                                    dangerouslySetInnerHTML={{ __html: contentWithAds.parts[1] }}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div
                                            className="prose prose-lg prose-gray max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: post.content }}
                                        />
                                    )}

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
                        <div className="border-t border-gray-200 pt-16">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-black text-gray-900">Conversations <span className="text-gray-400 font-normal">({comments.length})</span></h2>
                            </div>

                            <form onSubmit={handleCommentSubmit} className="mb-16 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold mb-6">Join the discussion</h3>
                                <div className="grid grid-cols-1 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="eg. John Doe"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            value={commentForm.authorName}
                                            onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Message</label>
                                        <textarea
                                            required
                                            rows="4"
                                            placeholder="What are your thoughts?"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                            value={commentForm.content}
                                            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full md:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    {submitting ? "Sharing..." : "Post Comment"}
                                </button>
                            </form>

                            <div className="space-y-8">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {comment.authorName[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{comment.authorName}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-lg">{comment.content}</p>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-medium">No comments yet. Be the first to share your thoughts!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>

                    {/* Sidebar Column */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Sidebar Ad 1 */}
                        <div className="sticky top-24">
                            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Advertisement</p>
                                {sidebarAd ? (
                                    <InFeedAd ad={sidebarAd} className="shadow-none border-0" />
                                ) : (
                                    <div className="bg-gray-50 aspect-square rounded-2xl flex items-center justify-center border border-dashed border-gray-200 p-8 text-center">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Space available for <br />Advertisement</p>
                                    </div>
                                )}
                            </div>

                            {/* More content for sidebar could go here (Trending, Newsletter etc) */}
                            <div className="mt-8 bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                <h3 className="text-xl font-black mb-4 relative z-10">Stay Updated</h3>
                                <p className="text-blue-100 mb-6 text-sm leading-relaxed relative z-10">Get the latest chemical business insights delivered directly to your inbox.</p>
                                <Link href="/about" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors relative z-10">
                                    Subscribe Now
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
