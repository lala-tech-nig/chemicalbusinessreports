"use client";

import { useState, useEffect, use } from "react";
import { Upload, Loader2, X, ArrowLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchPostById, updatePost, uploadFile } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

export default function EditPost({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        excerpt: "",
        excerptColor: "#FFFF00",
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
        const loadPost = async () => {
            try {
                const post = await fetchPostById(id);
                setFormData({
                    title: post.title || "",
                    category: post.category || "",
                    excerpt: post.excerpt || "",
                    excerptColor: post.excerptColor || "#FFFF00",
                    content: post.content || "",
                    isStoryOfTheDay: post.isStoryOfTheDay || false,
                    image: post.image || "",
                    video: post.video || "",
                    companyName: post.companyName || "",
                    productName: post.productName || "",
                    contactNumber: post.contactNumber || "",
                    website: post.website || "",
                    email: post.email || "",
                    researchTopic: post.researchTopic || "",
                    ceoDetails: post.ceoDetails || "",
                    companyServices: post.companyServices || "",
                    earlyBeginning: post.earlyBeginning || "",
                    fails: post.fails || "",
                    success: post.success || "",
                    awards: post.awards || "",
                    topic: post.topic || "",
                    subcategory: post.subcategory || "",
                    adSize: post.adSize || "",
                    adDuration: post.adDuration || 30,
                    author: post.author || "",
                    authorPhoto: post.authorPhoto || "",
                    status: post.status || "published"
                });
            } catch (error) {
                toast.error("Failed to load post");
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

    const handleContentChange = (value) => {
        setFormData((prev) => ({ ...prev, content: value }));
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

        // Auto-generate title/content for specific categories if missing (consistent with CreatePost)
        if (payload.category === "Chemical Mart") {
            if (!payload.title) payload.title = `${payload.companyName || ""} ${payload.productName ? "- " + payload.productName : ""}`.trim();
        } else if (payload.category === "Research & Reports") {
            if (!payload.title && payload.researchTopic) payload.title = payload.researchTopic;
        } else if (payload.category === "Corporate Profile") {
            if (!payload.title && payload.companyName) payload.title = payload.companyName;
        } else if (payload.category === "START UP") {
            if (!payload.title && payload.topic) payload.title = payload.topic;
        }

        try {
            await updatePost(id, payload);
            toast.success("Post updated successfully!");
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
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website URL</label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@..." className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" />
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
                                    <option value="1x1">1×1</option>
                                    <option value="2x1">2×1</option>
                                    <option value="1x2">1×2</option>
                                    <option value="2x2">2×2</option>
                                    <option value="3x1">3×1</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duration (Days) *</label>
                                <input type="number" name="adDuration" value={formData.adDuration} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
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
                            <label className="text-sm font-medium block mb-1">Upload Video (Optional)</label>
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
                                {videoUploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                ) : formData.video ? (
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
            case "START UP":
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Topic</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                    </>
                );
            default:
                return null;
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
                            <option value="Services">Services</option>
                        </select>
                    </div>

                    {renderDynamicFields()}

                    {formData.category !== "Chemical Mart" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Post Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2 md:col-span-3">
                                    <label className="text-sm font-medium">Excerpt / Summary</label>
                                    <textarea
                                        name="excerpt"
                                        value={formData.excerpt}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Summary Color</label>
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
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="font-semibold mb-4">Post Settings</h3>

                        <div className="space-y-4 mb-6 pb-6 border-b border-border">
                            <label className="text-sm font-medium block mb-1">Visibility Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none font-medium"
                            >
                                <option value="published">🟢 Published (Live)</option>
                                <option value="draft">🟡 Draft (Hidden)</option>
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">Drafts are only visible in the admin panel. Published posts are live on the website.</p>
                        </div>

                        <h3 className="font-semibold mb-4 mt-2">Media</h3>
                        <div className="space-y-4">
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
                                                className="w-full h-full object-contain rounded-md bg-muted"
                                            />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Change Image</span>
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
                                <label htmlFor="storyDay" className="text-sm font-medium">
                                    Story of the Day
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold mb-4 text-sm flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            Post Attribution
                        </h3>
                        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
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
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Author</span>
                                <span className="font-bold text-sm text-gray-900">{formData.author || "Admin"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
