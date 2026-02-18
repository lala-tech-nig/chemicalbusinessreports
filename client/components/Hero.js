"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero({ story }) {
    // Fallback if no story is provided
    const defaultStory = {
        title: "Global Chemical Market Surges Amidst New Innovation Trends",
        excerpt: "Discover how sustainable practices and digital transformation are reshaping the future of the chemical industry in our exclusive report.",
        image: null,
        date: "Oct 14, 2025",
        slug: "#"
    };

    const activeStory = story || defaultStory;

    return (
        <section className="relative w-full h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                {activeStory.image ? (
                    <Image
                        src={activeStory.image}
                        alt={activeStory.title}
                        fill
                        className="object-contain opacity-60"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-black opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md shadow-lg">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                        Story of the Day
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
                        {activeStory.title}
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-200 leading-relaxed">
                        {activeStory.excerpt}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                        <Link
                            href={`/posts/${activeStory.slug}`}
                            className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-lg font-medium text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
                        >
                            Read Full Story
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-4 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Published on {activeStory.date}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
