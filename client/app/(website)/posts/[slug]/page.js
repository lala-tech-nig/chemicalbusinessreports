"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { fetchSinglePost, fetchApprovedComments, createComment } from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function SinglePostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentForm, setCommentForm] = useState({ authorName: "", content: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const loadPost = async () => {
            try {
                const data = await fetchSinglePost(slug);
                setPost(data);
                // Load comments for this post
                if (data && data._id) {
                    const commentsData = await fetchApprovedComments(data._id);
                    setComments(commentsData);
                }
            } catch (err) {
                console.error("Failed to fetch post:", err);
                setError("Post not found");
            } finally {
                setLoading(false);
            }
        };

        loadPost();
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
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to all posts
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-background">
            <article className="max-w-3xl mx-auto px-4 sm:px-6">
                <Link href="/posts" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Posts
                </Link>

                <header className="mb-10 text-center">
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                        {post.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center text-muted-foreground space-x-6 text-sm">
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

                <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 shadow-lg">
                    {post.image ? (
                        post.image.match(/\.(mp4|webm|mov)$/i) ? (
                            <video
                                src={post.image}
                                className="w-full h-full object-cover"
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
                                className="object-cover"
                                priority
                            />
                        )
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                            No Image Available
                        </div>
                    )}
                </div>

                <div
                    className="prose prose-lg prose-gray max-w-none dark:prose-invert mb-16"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Comments Section */}
                <div className="border-t border-border pt-12">
                    <h2 className="text-2xl font-bold mb-8">Comments ({comments.length})</h2>

                    <form onSubmit={handleCommentSubmit} className="mb-12 bg-muted/30 p-6 rounded-xl border border-border/50">
                        <h3 className="text-lg font-semibold mb-4">Leave a Reply</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                    value={commentForm.authorName}
                                    onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Comment</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                value={commentForm.content}
                                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Post Comment"}
                        </button>
                    </form>

                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="bg-card p-6 rounded-lg border border-border shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold">{comment.authorName}</h4>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">{comment.content}</p>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </div>

            </article>
        </div>
    );
}
