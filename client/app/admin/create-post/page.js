"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Loader2, X, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPost, uploadFile } from "@/lib/api";
import Image from "next/image";
import RichTextEditor from "@/components/RichTextEditor";

export default function CreatePost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        excerpt: "",
        excerptColor: "#3972ed",
        content: "",
        isStoryOfTheDay: false,
        image: "",
        video: "",
        companyName: "",
        productName: "",
        contactNumber: "",
        website: "",
        email: "",
        researchTopic: "",
        ceoDetails: "",
        companyServices: "",
        earlyBeginning: "",
        fails: "",
        success: "",
        awards: "",
        topic: "",
        subcategory: "",
        adSize: "",
        adDuration: 30,
        author: "",
        authorPhoto: ""
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUsername = localStorage.getItem("adminUsername");
            const storedPhoto = localStorage.getItem("adminPhoto");
            if (storedUsername) {
                setFormData(prev => ({
                    ...prev,
                    author: storedUsername,
                    authorPhoto: storedPhoto || ""
                }));
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleContentChange = (value) => {
        setFormData((prev) => ({ ...prev, content: value }));
    };

    const handleFileChange = async (e, field = "image") => {
        const file = e.target.files[0];
        if (!file) return;

        if (field === "image") setUploading(true);
        else if (field === "authorPhoto") setUploading(true);
        else setVideoUploading(true);

        try {
            const data = await uploadFile(file);
            setFormData(prev => ({ ...prev, [field]: data.filePath }));
            toast.success(`${field === 'image' ? 'Image' : 'Video'} uploaded successfully`);
        } catch (error) {
            toast.error(`Failed to upload ${field}`);
        } finally {
            if (field === "image" || field === "authorPhoto") setUploading(false);
            else setVideoUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };

        if (payload.category === "Chemical Mart") {
            if (!payload.title) payload.title = `${payload.companyName || ""} ${payload.productName ? "- " + payload.productName : ""}`.trim();
            if (!payload.content) payload.content = `Chemical Mart listing for ${payload.companyName}`;
        } else if (payload.category === "Research & Reports") {
            if (!payload.title && payload.researchTopic) payload.title = payload.researchTopic;
            if (!payload.content) payload.content = "Research Report";
        } else if (payload.category === "Corporate Profile") {
            if (!payload.title && payload.companyName) payload.title = payload.companyName;
            if (!payload.content) payload.content = `Corporate Profile: ${payload.companyName}`;
        } else if (payload.category === "START UP") {
            if (!payload.title && payload.topic) payload.title = payload.topic;
            if (!payload.content) payload.content = "Startup Feature";
        } else if (payload.category === "News Roundup") {
            if (!payload.content) payload.content = "News Roundup article";
        }

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
            case "News Roundup":
                return null;
            case "Chemical Mart":
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subcategory *</label>
                            <select
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                                required
                            >
                                <option value="">Select Subcategory</option>
                                <option value="Cosmetics">Cosmetics</option>
                                <option value="Pharmaceutical">Pharmaceutical</option>
                                <option value="Industrial Chemicals">Industrial Chemicals</option>
                                <option value="Laboratory Equipment">Laboratory Equipment</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name *</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name *</label>
                            <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contact Number (WhatsApp) *</label>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="e.g., 2348012345678" className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                            <p className="text-xs text-muted-foreground">Include country code without '+' (e.g., 234...)</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website URL</label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="e.g., https://company.com" className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g., contact@company.com" className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ad Space Size *</label>
                                <select
                                    name="adSize"
                                    value={formData.adSize}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                                    required
                                >
                                    <option value="">Select Size</option>
                                    <option value="1x1">1×1 (Square)</option>
                                    <option value="2x1">2×1 (Double Width)</option>
                                    <option value="1x2">1×2 (Double Height)</option>
                                    <option value="2x2">2×2 (Large Square)</option>
                                    <option value="3x1">3×1 (Full Row)</option>
                                    <option value="1x3">1×3 (Tall)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duration (Days) *</label>
                                <input
                                    type="number"
                                    name="adDuration"
                                    value={formData.adDuration}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                                    required
                                />
                            </div>
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium block mb-1">Upload Documentary Video (Optional) or Image below</label>
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
                            <option value="Services">Services</option>
                            <option value="Executive Brief">Executive Brief</option>
                        </select>
                    </div>

                    {formData.category && (
                        <>
                            {/* Dynamic Fields */}
                            {renderDynamicFields()}

                            {/* Common Fields (hidden for Chemical Mart) */}
                            {formData.category !== "Chemical Mart" && (
                                <div className="space-y-4">
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
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2 md:col-span-3">
                                            <label className="text-sm font-medium">Excerpt / Summary (Recommended)</label>
                                            <textarea
                                                name="excerpt"
                                                value={formData.excerpt}
                                                onChange={handleChange}
                                                rows={2}
                                                placeholder="Brief summary snippet for cards and highlights"
                                                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Excerpt Background Color</label>
                                            <input
                                                type="color"
                                                name="excerptColor"
                                                value={formData.excerptColor}
                                                onChange={handleChange}
                                                className="w-full h-11 p-1 rounded-lg border border-input bg-background cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.category !== "Chemical Mart" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Article Content</label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={handleContentChange}
                                        placeholder="Write your post content here... Use the toolbar to format text, add links, change fonts and sizes."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Use the toolbar to bold text, change fonts, add links, adjust sizes, and more.
                                    </p>
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
                                            className="w-full h-full object-contain rounded-md bg-muted"
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

                        <div className="pt-6 border-t border-border mt-6">
                            <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Post attribution
                            </h3>
                            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-muted flex items-center justify-center">
                                        {formData.authorPhoto ? (
                                            <img
                                                src={formData.authorPhoto}
                                                alt={formData.author}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Author</span>
                                        <span className="font-semibold text-sm">{formData.author || "Admin"}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    * This post will be automatically attributed to your profile name and photo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
