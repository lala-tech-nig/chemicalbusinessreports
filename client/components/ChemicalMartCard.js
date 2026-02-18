"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Globe, Mail, Phone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChemicalMartCard({ post, className }) {
    const [modalOpen, setModalOpen] = useState(false);

    if (!post) return null;

    return (
        <>
            {/* Image-only banner — click opens modal */}
            <div
                className={cn(
                    "group relative w-full overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-muted",
                    className
                )}
                style={{ minHeight: "180px" }}
                onClick={() => setModalOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setModalOpen(true)}
                aria-label={`View details for ${post.companyName || post.title}`}
            >
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.companyName || post.title}
                        fill
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground min-h-[180px]">
                        <Building2 className="w-10 h-10 opacity-30" />
                    </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-semibold bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                        View Details
                    </span>
                </div>

                {/* Subcategory badge */}
                {post.subcategory && (
                    <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        {post.subcategory}
                    </div>
                )}

                {/* Ad size badge */}
                {post.adSize && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        {post.adSize}
                    </div>
                )}
            </div>

            {/* Info Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
                >
                    <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal header image */}
                        {post.image && (
                            <div className="relative h-48 w-full">
                                <Image
                                    src={post.image}
                                    alt={post.companyName || post.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="text-xs uppercase tracking-wider opacity-80">Chemical Mart</p>
                                    <h2 className="text-xl font-bold">{post.companyName}</h2>
                                </div>
                            </div>
                        )}

                        {/* Close button */}
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors z-10"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Modal body */}
                        <div className="p-6 space-y-4">
                            {!post.image && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-bold">{post.companyName}</h2>
                                </div>
                            )}

                            {post.productName && (
                                <p className="text-sm text-muted-foreground">{post.productName}</p>
                            )}

                            <div className="space-y-3 pt-2">
                                {post.website && (
                                    <a
                                        href={post.website.startsWith("http") ? post.website : `https://${post.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-sm text-primary hover:underline group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="truncate">{post.website}</span>
                                    </a>
                                )}

                                {post.email && (
                                    <a
                                        href={`mailto:${post.email}`}
                                        className="flex items-center gap-3 text-sm text-primary hover:underline"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-4 h-4 text-primary" />
                                        </div>
                                        <span>{post.email}</span>
                                    </a>
                                )}

                                {post.contactNumber && (
                                    <a
                                        href={`https://wa.me/${post.contactNumber}?text=${encodeURIComponent("hey, i saw your ad on chemicalbusinessreports website")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-sm text-primary hover:underline"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-4 h-4 text-primary" />
                                        </div>
                                        <span>{post.contactNumber}</span>
                                    </a>
                                )}
                            </div>

                            {post.subcategory && (
                                <div className="pt-2 border-t border-border">
                                    <span className="inline-block text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                                        {post.subcategory}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
