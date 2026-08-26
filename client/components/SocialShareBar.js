"use client";

import { useState, useEffect } from "react";
import { Share2, Check, Copy, MessageCircle, Linkedin, Facebook } from "lucide-react";
import { toast } from "sonner";

// X (formerly Twitter) Icon SVG
function XIcon({ className = "w-4 h-4" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

// WhatsApp Icon SVG
function WhatsAppIcon({ className = "w-4 h-4" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12c0 1.76.46 3.484 1.332 5.004L2 22l5.133-1.344A9.957 9.957 0 0012.031 22c5.516 0 10.01-4.49 10.01-10s-4.494-10-10.01-10zm0 18.273c-1.516 0-3-.406-4.305-1.18l-.309-.184-3.203.84.855-3.125-.2-.32A8.257 8.257 0 013.78 12c0-4.55 3.7-8.25 8.25-8.25s8.258 3.7 8.258 8.25c0 4.55-3.707 8.273-8.258 8.273zm4.523-6.195c-.246-.125-1.465-.723-1.691-.805-.227-.086-.395-.125-.563.125-.164.246-.64.805-.785.969-.145.164-.293.184-.539.063-.246-.125-1.04-.383-1.98-1.223-.73-.652-1.223-1.457-1.367-1.703-.145-.246-.016-.38.105-.5.11-.11.246-.293.371-.441.125-.145.164-.246.246-.41.082-.164.043-.31-.02-.43-.062-.125-.562-1.355-.77-1.855-.203-.49-.41-.422-.562-.43h-.48c-.164 0-.434.063-.66.31-.227.246-.867.848-.867 2.07 0 1.223.89 2.406 1.012 2.57.125.164 1.754 2.68 4.25 3.758.594.258 1.059.41 1.422.527.598.191 1.145.164 1.574.1.48-.07 1.465-.6 1.672-1.18.207-.578.207-1.074.145-1.18-.063-.105-.227-.164-.473-.289z" />
        </svg>
    );
}

export default function SocialShareBar({ post, className = "" }) {
    const [copied, setCopied] = useState(false);
    const [articleUrl, setArticleUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setArticleUrl(window.location.href);
        }
    }, []);

    if (!post) return null;

    const title = post.title || "Chemical Business Reports";
    const excerpt = post.excerpt || (post.content ? post.content.replace(/<[^>]*>?/gm, "").slice(0, 160) : "");
    const url = articleUrl || `https://chemicalbusinessreports.com/posts/${post.slug}`;

    // ── 1. Share on X (Twitter) ──────────────────────────────────────────────
    // Pre-populates the tweet with: Title + Excerpt + Link
    const handleShareX = () => {
        const tweetText = `${title}\n\n${excerpt ? excerpt.slice(0, 140) + "...\n\n" : ""}Read full article on @ChemicalReports:`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=520");
    };

    // ── 2. Share on WhatsApp ─────────────────────────────────────────────────
    const handleShareWhatsApp = () => {
        const text = `*${title}*\n\n${excerpt ? excerpt.slice(0, 120) + "...\n\n" : ""}Read more: ${url}`;
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
    };

    // ── 3. Share on LinkedIn ─────────────────────────────────────────────────
    const handleShareLinkedIn = () => {
        const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(liUrl, "_blank", "noopener,noreferrer,width=600,height=520");
    };

    // ── 4. Share on Facebook ─────────────────────────────────────────────────
    const handleShareFacebook = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=520");
    };

    // ── 5. Copy Link to Clipboard ────────────────────────────────────────────
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Article link copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    // ── 6. Native Share API (Mobile fallback) ────────────────────────────────
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: excerpt || "Chemical Business Reports",
                    url: url,
                });
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.log("Share error:", err);
                }
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-primary" /> Share:
            </span>

            {/* Share on X (Twitter) */}
            <button
                onClick={handleShareX}
                aria-label="Share on X (Twitter)"
                title="Share on X (Twitter)"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-transform hover:scale-105 shadow-sm active:scale-95"
            >
                <XIcon className="w-3.5 h-3.5" />
                <span>Share on X</span>
            </button>

            {/* Share on WhatsApp */}
            <button
                onClick={handleShareWhatsApp}
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-transform hover:scale-105 shadow-sm active:scale-95"
            >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
            </button>

            {/* Share on LinkedIn */}
            <button
                onClick={handleShareLinkedIn}
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold transition-transform hover:scale-105 shadow-sm active:scale-95"
            >
                <Linkedin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LinkedIn</span>
            </button>

            {/* Share on Facebook */}
            <button
                onClick={handleShareFacebook}
                aria-label="Share on Facebook"
                title="Share on Facebook"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1877F2] hover:bg-[#1567d3] text-white text-xs font-bold transition-transform hover:scale-105 shadow-sm active:scale-95"
            >
                <Facebook className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Facebook</span>
            </button>

            {/* Copy Link */}
            <button
                onClick={handleCopyLink}
                aria-label="Copy Article Link"
                title="Copy Article Link"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold transition-transform hover:scale-105 shadow-sm active:scale-95"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
        </div>
    );
}
