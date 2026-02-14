"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserDataModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        // Show modal after 15 seconds if not already submitted
        const hasSeen = localStorage.getItem("userDataSubmitted");
        if (!hasSeen) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        localStorage.setItem("userDataSubmitted", "true");
        setHasSubmitted(true);
        setTimeout(() => setIsOpen(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
                    >
                        {!hasSubmitted && (
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {hasSubmitted ? (
                            <div className="text-center py-8">
                                <h3 className="text-2xl font-bold text-green-500 mb-2">Thank You!</h3>
                                <p className="text-muted-foreground">You have successfully subscribed.</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
                                <p className="text-muted-foreground mb-6">
                                    Join our newsletter to receive the latest chemical industry news and reports.
                                </p>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Full Name</label>
                                        <input required type="text" className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email Address</label>
                                        <input required type="email" className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Company (Optional)</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="Acme Corp" />
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                        Subscribe Now
                                    </button>
                                </form>
                            </>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
