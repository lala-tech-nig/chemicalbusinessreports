"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const allNavLinks = [
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
    { name: "YouTube", href: "/youtube" },
];

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

    const isActive = (link) => {
        if (link.href === "/") return pathname === "/";
        return pathname === link.href || pathname.startsWith(link.href);
    };

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 max-w-full overflow-x-clip",
                scrolled ? "shadow-md" : ""
            )}
        >
            {/* Top bar: Logo + mobile menu button */}
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
                <div className="flex justify-between items-center h-14 lg:h-12">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="relative w-9 h-9 bg-white rounded-lg p-0.5 overflow-hidden group-hover:scale-105 transition-transform">
                            <Image
                                src="/coslab.png"
                                alt="Chemical Business Reports"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 uppercase tracking-widest leading-none">
                                Chemical Business
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-gray-500 tracking-widest leading-none mt-0.5">
                                Reports
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation - All links inline */}
                    <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center ml-4">
                        {allNavLinks.map((link) => {
                            const active = isActive(link);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "relative px-2 py-1.5 rounded-md text-[11px] xl:text-xs font-medium transition-all duration-200 whitespace-nowrap",
                                        active
                                            ? "text-blue-700 bg-blue-50 font-bold"
                                            : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                                    )}
                                >
                                    {link.name}
                                    {active && (
                                        <motion.span
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-blue-600 rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile burger */}
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
                            {allNavLinks.map((link) => {
                                const active = isActive(link);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                            active
                                                ? "bg-blue-600 text-white font-bold shadow-sm"
                                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span>{link.name}</span>
                                        {link.name === "ChemTalk" && (
                                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", active ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700")}>
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
