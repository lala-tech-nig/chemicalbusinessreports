"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const categories = [
    "All",
    "News Roundup",
    "Chemical Mart",
    "Research & Reports",
    "Corporate Profile",
    "START UP",
    "Services",
    "Executive Brief",
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
    return (
        <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-4 md:px-6 py-1 min-w-max">
                {categories.map((category) => {
                    const isActive = activeCategory === category;
                    return (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={cn(
                                "relative flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap select-none",
                                isActive
                                    ? "text-white shadow-md scale-105"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                            )}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="activeCat"
                                    className="absolute inset-0 rounded-full bg-primary z-0"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                            <span className="relative z-10">{category}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
