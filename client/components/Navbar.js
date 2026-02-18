"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "News Roundup",
    "Chemical Mart",
    "Research & Reports",
    "Corporate Profile",
    "Start Up",
    "Services",
    "Executive Brief",
];

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Posts", href: "/posts" },
    { name: "About Us", href: "/about" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const catRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close category dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (catRef.current && !catRef.current.contains(e.target)) {
                setCatOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const categoryHref = (cat) => `/posts?category=${encodeURIComponent(cat)}`;

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border bg-white dark:bg-background",
                scrolled ? "shadow-sm" : ""
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="relative w-12 h-12 group-hover:scale-105 transition-transform">
                            <Image
                                src="/main-logo.png"
                                alt="Chemical Business Reports"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium hover:text-primary transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                            </Link>
                        ))}

                        {/* Categories Dropdown */}
                        <div className="relative" ref={catRef}>
                            <button
                                onClick={() => setCatOpen((v) => !v)}
                                className={cn(
                                    "flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors relative group",
                                    catOpen && "text-primary"
                                )}
                            >
                                Categories
                                <ChevronDown className={cn("w-4 h-4 transition-transform", catOpen && "rotate-180")} />
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                            </button>

                            <AnimatePresence>
                                {catOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute top-full left-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <Link
                                                key={cat}
                                                href={categoryHref(cat)}
                                                onClick={() => setCatOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-3">
                        <button className="p-2 hover:bg-accent rounded-full transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-accent rounded-full transition-colors">
                            <User className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button className="p-2 hover:bg-accent rounded-full transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md hover:bg-accent transition-colors focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b border-border overflow-hidden"
                    >
                        <div className="px-4 pt-3 pb-6 space-y-1">
                            {/* Main nav links */}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="block px-3 py-2.5 rounded-lg text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Categories section */}
                            <div className="pt-3 mt-2 border-t border-border">
                                <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Categories
                                </p>
                                <div className="flex flex-wrap gap-2 px-3">
                                    {CATEGORIES.map((cat) => (
                                        <Link
                                            key={cat}
                                            href={categoryHref(cat)}
                                            onClick={() => setIsOpen(false)}
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
