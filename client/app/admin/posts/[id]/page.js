"use client";

import { useState, useEffect, use } from "react";
import { Upload, Loader2, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchPostById, updatePost, uploadFile } from "@/lib/api";
import Link from "next/link";

export default function EditPost({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        excerpt: "",
        content: "",
        isStoryOfTheDay: false,
        image: ""
    });

    useEffect(() => {
        const loadPost = async () => {
            try {
                const post = await fetchPostById(id);
                setFormData({
                    title: post.title,
                    category: post.category,
                    excerpt: post.excerpt,
                    content: post.content,
                    isStoryOfTheDay: post.isStoryOfTheDay,
                    image: post.image
                });
            } catch (error) {
                alert("Failed to load post");
                router.push("/admin/posts");
            } finally {
                setFetching(false);
            }
        };
        loadPost();
    }, [id, router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await uploadFile(file);
            setFormData(prev => ({ ...prev, image: data.filePath }));
        } catch (error) {
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updatePost(id, formData);
            alert("Post updated successfully!");
            router.push("/admin/posts");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/posts" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back to Posts
                </Link>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Edit Post</h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Updating..." : "Update Post"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Post Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter post title"
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Excerpt</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Short description for preview..."
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content (HTML or Text)</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={12}
                            placeholder="<p>Write your post content here...</p>"
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none resize-y font-mono text-sm"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="font-semibold mb-4">Publishing</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="News Roundup">News Roundup</option>
                                    <option value="Chemical Mart">Chemical Mart</option>
                                    <option value="Research & Reports">Research & Reports</option>
                                    <option value="Corporate Profile">Corporate Profile</option>
                                    <option value="START UP">START UP</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium block mb-1">Featured Image</label>
                                <div className={`border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${!formData.image ? 'hover:bg-accent/50 cursor-pointer' : ''} relative`}>

                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    ) : formData.image ? (
                                        <div className="relative w-full aspect-video">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Click to upload</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="storyDay"
                                    name="isStoryOfTheDay"
                                    checked={formData.isStoryOfTheDay}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="storyDay" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Set as Story of the Day
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
