"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail, Download } from "lucide-react";
import { fetchSubmissions } from "@/lib/api";

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchSubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to load submissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Company,Date\n"
            + submissions.map(s => `"${s.name}","${s.email}","${s.company || ''}","${new Date(s.createdAt).toLocaleDateString()}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "submissions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
                <button
                    onClick={handleExport}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {submissions.map((sub) => (
                            <tr key={sub._id} className="hover:bg-accent/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{sub.name}</td>
                                <td className="px-6 py-4">{sub.email}</td>
                                <td className="px-6 py-4 text-muted-foreground">{sub.company || "-"}</td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {submissions.length === 0 && (
                    <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                        <Mail className="w-10 h-10 mb-4 opacity-20" />
                        <p>No submissions found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
