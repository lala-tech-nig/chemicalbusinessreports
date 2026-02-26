"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
];

const categoryLinks = [
    { name: "News Roundup", href: "/posts/news-roundup" },
    { name: "Chemical Mart", href: "/posts/chemical-mart" },
    { name: "Research & Reports", href: "/posts/research-reports" },
    { name: "Corporate Profile", href: "/posts/corporate-profile" },
    { name: "Start Up", href: "/posts/startup" },
    { name: "Executive Brief", href: "/posts/executive-brief" },
];

const allLinks = [...navLinks, ...categoryLinks];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100",
                scrolled ? "shadow-md" : ""
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <div className="relative w-11 h-11 group-hover:scale-105 transition-transform">
                            <Image
                                src="/main-logo.png"
                                alt="Chemical Business Reports"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest leading-none">Chemical Business</p>
                            <p className="text-xs text-gray-500 tracking-widest leading-none mt-0.5">Reports</p>
                        </div>
                    </Link>

                    {/* Desktop Nav - all links flat */}
                    <div className="hidden lg:flex items-center gap-1">
                        {allLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap relative",
                                        isActive
                                            ? "text-blue-700 bg-blue-50"
                                            : "text-gray-700 hover:text-blue-700 hover:bg-blue-50/60"
                                    )}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {allLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
