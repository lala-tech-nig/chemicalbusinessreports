import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand & Description */}
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-11 h-11 bg-white rounded-lg p-1 overflow-hidden">
                                <Image
                                    src="/coslab.png"
                                    alt="Chemical Business Reports"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest leading-none">Chemical Business</p>
                                <p className="text-xs text-slate-400 tracking-widest leading-none mt-0.5">Reports</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Your trusted source for the latest chemical industry news, market reports, and corporate insights. Published by Coslab Media Concepts Ltd.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="https://web.facebook.com/chemicalreports?_rdc=1&_rdr#" className="text-slate-400 hover:text-blue-400 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://x.com/chemicalbiz" className="text-slate-400 hover:text-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/coslabmedia" className="text-slate-400 hover:text-blue-400 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/coslab-media-concepts-a564551ab/" className="text-slate-400 hover:text-blue-400 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Navigation</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="text-slate-400 hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link href="/about" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link href="/posts" className="text-slate-400 hover:text-blue-400 transition-colors">All Posts</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/posts/news-roundup" className="text-slate-400 hover:text-blue-400 transition-colors">News Roundup</Link></li>
                            <li><Link href="/posts/chemical-mart" className="text-slate-400 hover:text-blue-400 transition-colors">Chemical Mart</Link></li>
                            <li><Link href="/posts/research-reports" className="text-slate-400 hover:text-blue-400 transition-colors">Research &amp; Reports</Link></li>
                            <li><Link href="/posts/corporate-profile" className="text-slate-400 hover:text-blue-400 transition-colors">Corporate Profile</Link></li>
                            <li><Link href="/posts/startup" className="text-slate-400 hover:text-blue-400 transition-colors">Start Up</Link></li>
                            <li><Link href="/posts/executive-brief" className="text-slate-400 hover:text-blue-400 transition-colors">Executive Brief</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Chemical Business Reports. All rights reserved.</p>
                    <p>Published by Coslab Media Concepts Ltd.</p>
                </div>
            </div>
        </footer>
    );
}
