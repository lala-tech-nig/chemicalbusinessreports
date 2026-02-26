"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative w-full h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1581093577421-f561a654a353?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Chemical Industry Background"
                    fill
                    className="object-cover opacity-50 contrast-125 grayscale-[20%]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/60 to-transparent" />
            </div>

            <div className="container relative z-10 px-4 md:px-8 mx-auto text-left text-white mt-16">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl space-y-6"
                >
                    <div className="space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white"
                        >
                            Coslab Media <br />
                            <span className="text-blue-400">Concepts (Ltd)</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-xl md:text-2xl font-semibold text-blue-100 max-w-2xl"
                        >
                            An innovative media, public relations and marketing company.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="space-y-3"
                        >
                            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-400">Our Publication</h3>
                            <p className="text-gray-200 leading-relaxed font-medium">
                                We are the publishers of <span className="text-white font-bold italic">Chemical Business Reports</span>, your trusted source for the latest chemical &amp; allied industries news, market reports, and corporate insights.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="space-y-3"
                        >
                            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-400">Public Relations</h3>
                            <p className="text-gray-200 leading-relaxed font-medium">
                                As a public relations company, we highlight the industry&apos;s corporate players and individuals who have contributed to its growth and development.
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="flex flex-wrap gap-4 pt-4"
                    >
                        <Link
                            href="/posts/news-roundup"
                            className="inline-flex h-14 items-center justify-center rounded-lg bg-blue-600 px-8 text-lg font-bold text-white shadow-xl transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
                        >
                            Explore Reports
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex h-14 items-center justify-center rounded-lg bg-white/10 border border-white/20 px-8 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
                        >
                            About Us
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
}
