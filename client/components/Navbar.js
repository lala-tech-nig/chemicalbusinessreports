"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Primary desktop links that fit gracefully across screens
const primaryNavLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "News Roundup", href: "/posts/news-roundup" },
    { name: "Chemical Business Mart", href: "/posts/chemical-mart" },
    { name: "ChemTalk", href: "/chemtalk" },
    { name: "Awards & Partners", href: "/awards" },
];

// Additional categories accessible via a sleek dropdown on desktop
const moreCategories = [
    { name: "Research & Reports", href: "/posts/research-reports", desc: "In-depth market studies & sector intelligence" },
    { name: "Corporate Profile", href: "/posts/corporate-profile", desc: "Executive profiles of industry leaders" },
    { name: "Start Up", href: "/posts/startup", desc: "Emerging chemical ventures & innovation" },
    { name: "Executive Brief", href: "/posts/executive-brief", desc: "High-level strategic market briefs" },
];

// All links shown sequentially in the mobile drawer
const allMobileLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "News Roundup", href: "/posts/news-roundup" },
    { name: "Chemical Business Mart", href: "/posts/chemical-mart" },
    { name: "ChemTalk", href: "/chemtalk" },
    { name: "Awards & Partners", href: "/awards" },
    { name: "Research & Reports", href: "/posts/research-reports" },
    { name: "Corporate Profile", href: "/posts/corporate-profile" },
    { name: "Start Up", href: "/posts/startup" },
    { name: "Executive Brief", href: "/posts/executive-brief" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menus when route changes
    useEffect(() => {
        setIsOpen(false);
        setDropdownOpen(false);
    }, [pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check if current page is inside the 'More' dropdown
    const isMoreActive = moreCategories.some(
        (cat) => pathname === cat.href || pathname.startsWith(cat.href)
    );

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 max-w-full overflow-x-clip",
                scrolled ? "shadow-md" : ""
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-lg p-1 overflow-hidden group-hover:scale-105 transition-transform">
                            <Image
                                src="/coslab.png"
                                alt="Chemical Business Reports"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider sm:tracking-widest leading-none">
                                Chemical Business
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 tracking-wider sm:tracking-widest leading-none mt-0.5">
                                Reports
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
                        {primaryNavLinks.map((link) => {
                            const isActive =
                                pathname === link.href ||
                                (link.name === "News Roundup" && pathname.startsWith("/posts/news-roundup")) ||
                                (link.name === "ChemTalk" && pathname.startsWith("/chemtalk")) ||
                                (link.name === "Awards & Partners" && pathname.startsWith("/awards")) ||
                                (link.name === "Chemical Mart" && pathname.startsWith("/posts/chemical-mart"));

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 whitespace-nowrap relative flex items-center gap-1",
                                        isActive
                                            ? "text-blue-700 bg-blue-50 font-bold"
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

                        {/* 'More Categories' Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className={cn(
                                    "px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1 cursor-pointer",
                                    isMoreActive
                                        ? "text-blue-700 bg-blue-50 font-bold"
                                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50/60"
                                )}
                            >
                                <span>More</span>
                                <ChevronDown
                                    className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-200",
                                        dropdownOpen ? "rotate-180 text-blue-600" : "text-gray-400"
                                    )}
                                />
                                {isMoreActive && (
                                    <motion.span
                                        layoutId="nav-indicator-more"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full"
                                    />
                                )}
                            </button>

                            {/* Dropdown Menu Box */}
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 z-50 overflow-hidden"
                                    >
                                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            Specialized Categories
                                        </div>
                                        <div className="space-y-0.5">
                                            {moreCategories.map((cat) => {
                                                const isCatActive = pathname === cat.href || pathname.startsWith(cat.href);
                                                return (
                                                    <Link
                                                        key={cat.name}
                                                        href={cat.href}
                                                        onClick={() => setDropdownOpen(false)}
                                                        className={cn(
                                                            "block px-3 py-2 rounded-xl text-xs transition-colors",
                                                            isCatActive
                                                                ? "bg-blue-50 text-blue-700 font-bold"
                                                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                                                        )}
                                                    >
                                                        <div className="font-semibold text-xs leading-snug">{cat.name}</div>
                                                        <div className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">
                                                            {cat.desc}
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right side: Mobile burger button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
                    >
                        <div className="px-4 py-3 space-y-1 max-h-[75vh] overflow-y-auto">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1">
                                Navigation
                            </div>
                            {allMobileLinks.map((link) => {
                                const isActive =
                                    pathname === link.href ||
                                    (link.name === "News Roundup" && pathname.startsWith("/posts/news-roundup")) ||
                                    (link.name === "ChemTalk" && pathname.startsWith("/chemtalk")) ||
                                    (link.name === "Awards & Partners" && pathname.startsWith("/awards")) ||
                                    (link.name === "Chemical Mart" && pathname.startsWith("/posts/chemical-mart")) ||
                                    pathname.startsWith(link.href);

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-600 text-white font-bold shadow-sm"
                                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span>{link.name}</span>
                                        {link.name === "ChemTalk" && (
                                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700")}>
                                                Community
                                            </span>
                                        )}
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
