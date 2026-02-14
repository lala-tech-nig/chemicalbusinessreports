import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-muted/50 border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Chemical Reports</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your trusted source for the latest chemical industry news, market reports, and corporate insights.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
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
                            <li><Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="#advertise" className="text-muted-foreground hover:text-primary transition-colors">Advertise with us</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#news-roundup" className="text-muted-foreground hover:text-primary transition-colors">News Roundup</Link></li>
                            <li><Link href="#chemical-mart" className="text-muted-foreground hover:text-primary transition-colors">Chemical Mart</Link></li>
                            <li><Link href="#research-reports" className="text-muted-foreground hover:text-primary transition-colors">Research & Reports</Link></li>
                            <li><Link href="#start-up" className="text-muted-foreground hover:text-primary transition-colors">Startups</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Subscribe</h4>
                        <p className="text-sm text-muted-foreground">
                            Get the latest updates directly to your inbox.
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Chemical Business Reports. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
