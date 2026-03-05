"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
];

const roundupSubLinks = [
    { name: "Pharma", href: "/posts/news-roundup/pharma" },
    { name: "Cosmetics & Personal Care", href: "/posts/news-roundup/cosmetics-personal-care" },
    { name: "Paints & Chemicals", href: "/posts/news-roundup/paints-chemicals" },
    { name: "Brewing, Foods & Drinks", href: "/posts/news-roundup/brewing-foods-drinks" },
    { name: "Beverages", href: "/posts/news-roundup/beverages" },
    { name: "Industries Chemical", href: "/posts/news-roundup/industries-chemical" },
];

const categoryLinks = [
    { name: "News Roundup", href: "/posts/news-roundup", hasDropdown: true },
    { name: "Chemical Mart", href: "/posts/chemical-mart" },
    { name: "Research & Reports", href: "/posts/research-reports" },
    { name: "Corporate Profile", href: "/posts/corporate-profile" },
    { name: "Start Up", href: "/posts/startup" },
    { name: "Executive Brief", href: "/posts/executive-brief" },
];

const allLinks = [...navLinks, ...categoryLinks];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [roundupOpen, setRoundupOpen] = useState(false);
    const [mobileRoundupOpen, setMobileRoundupOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setRoundupOpen(false);
    }, [pathname]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setRoundupOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isRoundupActive = pathname.startsWith("/posts/news-roundup");

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
                                src="/newlogo.png"
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

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {/* Static nav links */}
                        {navLinks.map((link) => {
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

                        {/* News Roundup with dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setRoundupOpen((prev) => !prev)}
                                onMouseEnter={() => setRoundupOpen(true)}
                                className={cn(
                                    "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap relative",
                                    isRoundupActive
                                        ? "text-blue-700 bg-blue-50"
                                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50/60"
                                )}
                            >
                                News Roundup
                                <ChevronDown
                                    className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-200",
                                        roundupOpen ? "rotate-180" : ""
                                    )}
                                />
                                {isRoundupActive && pathname === "/posts/news-roundup" && (
                                    <motion.span
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full"
                                    />
                                )}
                            </button>

                            <AnimatePresence>
                                {roundupOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        onMouseLeave={() => setRoundupOpen(false)}
                                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                    >
                                        {/* All News Roundup link */}
                                        <Link
                                            href="/posts/news-roundup"
                                            className={cn(
                                                "block px-4 py-2.5 text-sm font-semibold border-b border-gray-100 transition-colors",
                                                pathname === "/posts/news-roundup"
                                                    ? "text-blue-700 bg-blue-50"
                                                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                            )}
                                        >
                                            All News Roundup
                                        </Link>
                                        {roundupSubLinks.map((sub) => (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                className={cn(
                                                    "block px-4 py-2.5 text-sm transition-colors",
                                                    pathname === sub.href
                                                        ? "text-blue-700 bg-blue-50 font-medium"
                                                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                )}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Remaining category links (excluding News Roundup) */}
                        {categoryLinks.filter(l => !l.hasDropdown).map((link) => {
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

                    {/* Right side: Admin Dashboard link + Mobile burger */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                            title="Admin Posting Dashboard"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden md:inline">Admin</span>
                        </Link>

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
                            {/* Static nav links */}
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                            isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* News Roundup toggle */}
                            <div>
                                <button
                                    onClick={() => setMobileRoundupOpen((prev) => !prev)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isRoundupActive
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    )}
                                >
                                    News Roundup
                                    <ChevronDown
                                        className={cn(
                                            "w-4 h-4 transition-transform duration-200",
                                            mobileRoundupOpen ? "rotate-180" : ""
                                        )}
                                    />
                                </button>
                                <AnimatePresence>
                                    {mobileRoundupOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-1 ml-4 space-y-0.5 border-l-2 border-blue-200 pl-3">
                                                <Link
                                                    href="/posts/news-roundup"
                                                    className={cn(
                                                        "block px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                                                        pathname === "/posts/news-roundup"
                                                            ? "text-blue-700 bg-blue-50"
                                                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                    )}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    All News Roundup
                                                </Link>
                                                {roundupSubLinks.map((sub) => (
                                                    <Link
                                                        key={sub.name}
                                                        href={sub.href}
                                                        className={cn(
                                                            "block px-3 py-2 rounded-lg text-sm transition-colors",
                                                            pathname === sub.href
                                                                ? "text-blue-700 bg-blue-50 font-medium"
                                                                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                        )}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Remaining category links */}
                            {categoryLinks.filter(l => !l.hasDropdown).map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                            isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Admin link in mobile */}
                            
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
