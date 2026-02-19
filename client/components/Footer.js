import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-muted/50 border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <div className="relative w-12 h-12 mb-4">
                            <Image
                                src="/main-logo.png"
                                alt="Chemical Business Reports"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your trusted source for the latest chemical industry news, market reports, and corporate insights.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="https://web.facebook.com/chemicalreports?_rdc=1&_rdr#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://x.com/chemicalbiz" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/coslabmedia" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/posts?category=News%20Roundup" className="text-muted-foreground hover:text-primary transition-colors">News Roundup</Link></li>
                            <li><Link href="/posts?category=Chemical%20Mart" className="text-muted-foreground hover:text-primary transition-colors">Chemical Mart</Link></li>
                            <li><Link href="/posts?category=Research%20%26%20Reports" className="text-muted-foreground hover:text-primary transition-colors">Research & Reports</Link></li>
                            <li><Link href="/posts?category=Start%20Up" className="text-muted-foreground hover:text-primary transition-colors">Startups</Link></li>
                        </ul>
                    </div>

                
                </div>

                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Chemical Business Reports. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
