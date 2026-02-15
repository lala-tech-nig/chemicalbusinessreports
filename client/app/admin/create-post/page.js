"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPost, uploadFile } from "@/lib/api";
import Image from "next/image";

export default function CreatePost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        excerpt: "",
        content: "",
        isStoryOfTheDay: false,
        image: "",
        video: "",
        companyName: "",
        productName: "",
        contactNumber: "",
        researchTopic: "",
        ceoDetails: "",
        companyServices: "",
        earlyBeginning: "",
        fails: "",
        success: "",
        awards: "",
        topic: ""
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileChange = async (e, field = "image") => {
        const file = e.target.files[0];
        if (!file) return;

        if (field === "image") setUploading(true);
        else setVideoUploading(true);

        try {
            const data = await uploadFile(file);
            setFormData(prev => ({ ...prev, [field]: data.filePath }));
            toast.success(`${field === 'image' ? 'Image' : 'Video'} uploaded successfully`);
        } catch (error) {
            toast.error(`Failed to upload ${field}`);
        } finally {
            if (field === "image") setUploading(false);
            else setVideoUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };

        // Auto-populate Title and Content for specific categories if missing
        if (payload.category === "Chemical Mart") {
            if (!payload.title) payload.title = `${payload.companyName || ""} ${payload.productName ? "- " + payload.productName : ""}`.trim();
            if (!payload.content) payload.content = `Chemical Mart listing for ${payload.companyName}`;
        } else if (payload.category === "Research & Reports") {
            if (!payload.title && payload.researchTopic) payload.title = payload.researchTopic;
            if (!payload.content) payload.content = "Research Report"; // User fills this in UI usually
        } else if (payload.category === "Corporate Profile") {
            if (!payload.title && payload.companyName) payload.title = payload.companyName;
            if (!payload.content) payload.content = `Corporate Profile: ${payload.companyName}`;
        } else if (payload.category === "START UP") {
            if (!payload.title && payload.topic) payload.title = payload.topic;
            if (!payload.content) payload.content = "Startup Feature";
        }

        // Final fallback
        if (!payload.title) payload.title = "Untitled Post";
        if (!payload.content) payload.content = "No content description";

        try {
            await createPost(payload);
            toast.success("Post created successfully!");
            router.push("/admin/posts");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderDynamicFields = () => {
        switch (formData.category) {
            case "Chemical Mart":
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contact Number</label>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                    </>
                );
            case "Research & Reports":
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Research Topic</label>
                            <input type="text" name="researchTopic" value={formData.researchTopic} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        {/* Video Upload Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium block mb-1">Upload Documentry Video (Optional) or Image below</label>
                            <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center relative">
                                {videoUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : formData.video ? (
                                    <div className="relative w-full">
                                        <p className="text-sm text-green-600 truncate">{formData.video}</p>
                                        <button onClick={() => setFormData(prev => ({ ...prev, video: "" }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" accept="video/*,image/*" onChange={(e) => handleFileChange(e, "video")} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Upload Video</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                );
            case "Corporate Profile":
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">CEO Details</label>
                            <textarea name="ceoDetails" value={formData.ceoDetails} onChange={handleChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Services</label>
                            <textarea name="companyServices" value={formData.companyServices} onChange={handleChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Early Beginning</label>
                                <textarea name="earlyBeginning" value={formData.earlyBeginning} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fails</label>
                                <textarea name="fails" value={formData.fails} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Success</label>
                                <textarea name="success" value={formData.success} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Awards</label>
                                <textarea name="awards" value={formData.awards} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium block mb-1">CEO Comment (Video Optional)</label>
                            <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center relative">
                                {videoUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : formData.video ? (
                                    <div className="relative w-full">
                                        <p className="text-sm text-green-600 truncate">{formData.video}</p>
                                        <button onClick={() => setFormData(prev => ({ ...prev, video: "" }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" accept="video/*,image/*" onChange={(e) => handleFileChange(e, "video")} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Upload Video</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                );
            case "START UP":
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Topic</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium block mb-1">Article Video (Optional)</label>
                            <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center relative">
                                {videoUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : formData.video ? (
                                    <div className="relative w-full">
                                        <p className="text-sm text-green-600 truncate">{formData.video}</p>
                                        <button onClick={() => setFormData(prev => ({ ...prev, video: "" }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Upload Video</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Create New Post</h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Publishing..." : "Publish Post"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Category Selection First */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium block mb-1">Category (Select First)</label>
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

                    {formData.category && (
                        <>
                            {/* Dynamic Fields */}
                            {renderDynamicFields()}

                            {/* Common Fields */}

                            {/* "Chemical Mart" does NOT need Title/Excerpt/Content? 
                                User: "on click on chemical mart, it will only need an image upload, company name, product name, and contact number."
                                So I should HIDE standard fields for Chemical Mart.
                            */}
                            {formData.category !== "Chemical Mart" && (
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
                            )}

                            {formData.category !== "Chemical Mart" && (
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
                            )}

                            {formData.category !== "Chemical Mart" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Article Content (HTML or Text)</label>
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
                            )}
                        </>
                    )}

                    {!formData.category && (
                        <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                            Please select a category to begin creating your post.
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="font-semibold mb-4">Publishing & Media</h3>
                        <div>
                            <label className="text-sm font-medium block mb-1">Featured Image (Required for all)</label>
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
                                            onChange={(e) => handleFileChange(e, "image")}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Click to upload Image</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4">
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
    );
}
