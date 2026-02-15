"use client";

import { useState, useEffect } from "react";
import { Upload, Calendar, X, Trash2, Eye, Loader2 } from "lucide-react";
import { fetchActiveAds, createAd, deleteAd, uploadFile } from "@/lib/api";
import { toast } from "sonner";

export default function AdManagement() {
    const [ads, setAds] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fileUploading, setFileUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        type: "popup",
        durationDays: 7,
        link: "",
        actionType: "link",
        whatsappNumber: "",
        image: ""
    });

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        try {
            const data = await fetchActiveAds();
            setAds(data);
        } catch (error) {
            console.error("Failed to load ads", error);
            toast.error("Failed to load ads");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        try {
            await createAd(formData);
            toast.success("Ad campaign launched successfully!");
            setIsFormOpen(false);
            setFormData({ title: "", type: "popup", durationDays: 7, link: "", actionType: "link", whatsappNumber: "", image: "" });
            loadAds(); // Refresh list
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileUploading(true);
        try {
            const data = await uploadFile(file);
            setFormData(prev => ({ ...prev, image: data.filePath }));
            toast.success("Media uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload file");
        } finally {
            setFileUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to stop this ad campaign?")) return;
        try {
            await deleteAd(id);
            setAds(ads.filter(a => a._id !== id));
            toast.success("Ad campaign deleted");
        } catch (error) {
            toast.error("Failed to delete ad");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Ad Management</h1>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    {isFormOpen ? "Cancel" : "Create New Ad"}
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold mb-4">Create New Advertisement</h2>
                    <form onSubmit={handleCreateAd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ad Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Action Type</label>
                                <div className="flex space-x-4 mb-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="actionType"
                                            value="link"
                                            checked={formData.actionType === "link"}
                                            onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                                            className="form-radio text-primary"
                                        />
                                        <span>Website Link</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="actionType"
                                            value="whatsapp"
                                            checked={formData.actionType === "whatsapp"}
                                            onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                                            className="form-radio text-primary"
                                        />
                                        <span>WhatsApp</span>
                                    </label>
                                </div>
                            </div>

                            {formData.actionType === "link" ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Destination URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://"
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2348012345678"
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                        value={formData.whatsappNumber}
                                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Include country code without '+' (e.g. 234...)</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ad Type</label>
                                <select
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="popup">Main Screen Popup (Priority)</option>
                                    <option value="card">In-Feed Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Duration (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                    value={formData.durationDays}
                                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ad Media (Image/Video)</label>
                                <div className={`border-2 border-dashed border-input rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${!formData.image ? 'hover:bg-accent/50 cursor-pointer' : ''} relative h-32`}>
                                    {fileUploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    ) : formData.image ? (
                                        <div className="relative w-full h-full">
                                            {formData.image.match(/\.(mp4|webm|mov)$/i) ? (
                                                <video src={formData.image} className="w-full h-full object-cover rounded-md" controls />
                                            ) : (
                                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Upload Media</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                                Launch Ad campaign
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* active ads list */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">End Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {ads.map((ad) => (
                            <tr key={ad._id} className="hover:bg-accent/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{ad.title}</td>
                                <td className="px-6 py-4 capitalize">{ad.type === 'popup' ? 'Main Popup' : 'In-Feed'}</td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(ad.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {ad.isActive ? "Active" : "Expired"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(ad._id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Delete Ad"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ads.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No active ads found.
                    </div>
                )}
            </div>
        </div>
    );
}
