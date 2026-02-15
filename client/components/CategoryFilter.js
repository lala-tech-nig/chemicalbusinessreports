"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
    "All",
    "News Roundup",
    "Chemical Mart",
    "Research & Reports",
    "Corporate Profile",
    "START UP"
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
    return (
        <div className="w-full overflow-x-auto py-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex space-x-2 min-w-max px-2 md:px-0">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={cn(
                            "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ring-1 ring-inset",
                            activeCategory === category
                                ? "bg-primary text-primary-foreground ring-primary shadow-md"
                                : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300"
                        )}
                    >
                        {activeCategory === category && (
                            <motion.span
                                layoutId="activeCategory"
                                className="absolute inset-0 bg-primary rounded-full -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{category}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
