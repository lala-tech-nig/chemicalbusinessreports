"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Ban, Loader2, Trash2, Upload, X, Pencil } from "lucide-react";
import { fetchUsers, registerUser, updateUserStatus, deleteUser, uploadFile, updateUser as apiUpdateUser } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { user: currentUser, updateUser } = useUser();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "admin", // or 'moderator'
        profilePhoto: ""
    });
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Instant local preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        setUploading(true);
        try {
            const data = await uploadFile(file);
            setFormData(prev => ({ ...prev, profilePhoto: data.filePath }));
            toast.success("Photo uploaded!");
        } catch (error) {
            toast.error("Failed to upload photo");
            setPreviewUrl(""); // Reset if upload fails
        } finally {
            setUploading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const response = await apiUpdateUser(editingId, formData);

                // If editing self, update the global context immediately
                if (editingId === currentUser.id) {
                    updateUser({
                        username: response.username,
                        photo: response.profilePhoto || ""
                    });
                }

                toast.success("User updated successfully!");
            } else {
                await registerUser(formData);
                toast.success("User created successfully!");
            }
            setIsFormOpen(false);
            setIsEditing(false);
            setEditingId(null);
            setPreviewUrl("");
            setFormData({ username: "", email: "", password: "", role: "admin", profilePhoto: "" });
            loadUsers();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEditEnter = (user) => {
        setFormData({
            username: user.username,
            email: user.email,
            password: "", // Leave blank for security
            role: user.role,
            profilePhoto: user.profilePhoto || ""
        });
        setPreviewUrl(user.profilePhoto || "");
        setEditingId(user._id);
        setIsEditing(true);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setPreviewUrl("");
        setFormData({ username: "", email: "", password: "", role: "admin", profilePhoto: "" });
    };

    const handleStatusChange = async (id, currentStatus) => {
        try {
            await updateUserStatus(id);
            setUsers(users.map(user =>
                user._id === id ? { ...user, isActive: !user.isActive } : user
            ));
            toast.success("User status updated");
        } catch (error) {
            toast.error(error.message || "Failed to update user status");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            toast.success("User deleted successfully");
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };


    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <button
                    onClick={() => isFormOpen ? handleCancel() : setIsFormOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    {isFormOpen ? "Cancel" : "Add New User"}
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 max-w-2xl">
                    <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Account" : "Create New Account"}</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password {isEditing && "(Leave blank to keep current)"}</label>
                            <input
                                type="password"
                                required={!isEditing}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Profile Photo</label>
                            <div className="relative border-2 border-dashed border-input rounded-xl p-6 flex flex-col items-center justify-center transition-colors hover:bg-accent/50 cursor-pointer">
                                {uploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                ) : previewUrl ? (
                                    <div className="relative w-24 h-24">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, profilePhoto: "" }));
                                                setPreviewUrl("");
                                            }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
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
                                        <p className="text-sm font-medium text-muted-foreground">Click to upload photo</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                                {isEditing ? "Update Account" : "Create Account"}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 rounded-lg font-medium border border-border hover:bg-accent"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-accent/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0 border border-border">
                                            {user.profilePhoto ? (
                                                <img src={user.profilePhoto} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-muted-foreground text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 capitalize">
                                    <span className="flex items-center gap-1">
                                        {user.role === 'admin' && <Shield className="w-3 h-3 text-blue-500" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.isActive ? "Active" : "Suspended"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditEnter(user)}
                                        className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                                        title="Edit User"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(user._id)}
                                        className={`p-2 transition-colors ${user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}`}
                                        title={user.isActive ? "Suspend User" : "Activate User"}
                                    >
                                        {user.isActive ? <Ban className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
