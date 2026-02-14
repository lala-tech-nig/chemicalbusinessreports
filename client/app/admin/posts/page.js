"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchPosts, deletePost, setStoryOfTheDay } from "@/lib/api";

export default function PostsList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("admin");

    useEffect(() => {
        const storedRole = localStorage.getItem("adminRole");
        if (storedRole) setRole(storedRole);
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await fetchPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePost(id);
            setPosts(posts.filter(p => p._id !== id));
        } catch (error) {
            alert("Failed to delete post");
        }
    };

    const handleSetStory = async (id) => {
        try {
            await setStoryOfTheDay(id);
            // Refresh posts to show updated status (or update local state optimally)
            loadPosts();
        } catch (error) {
            alert("Failed to update story setting");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">All Posts</h1>
                <Link
                    href="/admin/create-post"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Create New
                </Link>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-accent/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post._id} className="bg-card hover:bg-accent/50 transition-colors border-b border-border last:border-0">
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        {post.isStoryOfTheDay && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                        {post.title}
                                    </td>
                                    <td className="px-6 py-4">{post.category}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {role === 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => handleSetStory(post._id)}
                                                    className={`p-1 transition-colors ${post.isStoryOfTheDay ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                                    title="Set as Story of the Day"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/admin/posts/${post._id}`}
                                                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors inline-block"
                                                    title="Edit Post"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post._id)}
                                                    className="p-1 hover:text-destructive transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
