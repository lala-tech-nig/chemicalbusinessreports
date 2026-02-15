"use client";

import { useState, useEffect } from "react";
import { Check, Trash2, Loader2, MessageSquare } from "lucide-react";
import { fetchPendingComments, approveComment, deleteComment } from "@/lib/api";
import { toast } from "sonner";

export default function CommentsManagement() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const data = await fetchPendingComments();
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments", error);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveComment(id);
            setComments(comments.filter(c => c._id !== id));
            toast.success("Comment approved");
        } catch (error) {
            toast.error("Failed to approve comment");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            await deleteComment(id);
            setComments(comments.filter(c => c._id !== id));
            toast.success("Comment deleted");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Comments Moderation</h1>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Author</th>
                            <th className="px-6 py-4">Comment</th>
                            <th className="px-6 py-4">Post</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {comments.map((comment) => (
                            <tr key={comment._id} className="hover:bg-accent/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{comment.authorName}</td>
                                <td className="px-6 py-4 max-w-md">
                                    <p className="line-clamp-2">{comment.content}</p>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {comment.post ? comment.post.title : "Unknown Post"}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleApprove(comment._id)}
                                        className="text-green-600 hover:text-green-800 p-2 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                                        title="Approve"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {comments.length === 0 && (
                    <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="w-10 h-10 mb-4 opacity-20" />
                        <p>No pending comments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
