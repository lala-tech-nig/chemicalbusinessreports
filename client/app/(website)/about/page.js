"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-gray-900">
                            Driving Intelligence in the <br className="hidden md:block" /> Global Chemical Industry
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
                            Chemical Business Reports is the premier source for critical market insights, innovation trends, and corporate intelligence. We empower industry leaders to make data-driven decisions that shape the future.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-primary/20 to-black/80 flex items-center justify-center p-12">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/main-logo.png"
                                        alt="Chemical Business Reports"
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        priority
                                    />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                At Chemical Business Reports, we believe that accurate information is the catalyst for progress. Our mission is to bridge the gap between complex market dynamics and actionable business strategy.
                            </p>
                            <p className="text-lg text-muted-foreground mb-8">
                                From emerging startups in green chemistry to petrochemical giants navigating regulatory shifts, we cover the entire spectrum of the chemical value chain with depth, precision, and objectivity.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-bold text-primary">50k+</span>
                                    <span className="text-sm text-muted-foreground">Monthly Readers</span>
                                </div>
                                <div className="w-px bg-border mx-4" />
                                <div className="flex flex-col">
                                    <span className="text-4xl font-bold text-primary">100+</span>
                                    <span className="text-sm text-muted-foreground">Countries Reach</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Founder Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0"
                        >
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 blur-xl animate-pulse"></div>
                            <Image
                                src="/folusho.png"
                                alt="Foluso Olorunfemi"
                                fill
                                className="object-cover rounded-full shadow-2xl border-4 border-white z-10 relative"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center md:text-left flex-1"
                        >
                            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                                Meet the Founder
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Foluso Olorunfemi</h2>

                            <blockquote className="relative text-xl md:text-2xl text-gray-600 italic mb-8 leading-relaxed">
                                <span className="absolute -top-4 -left-2 text-6xl text-primary/20">"</span>
                                Striving daily to live at peace with man and God.
                                <span className="absolute -bottom-10 right-0 text-6xl text-primary/20 rotate-180">"</span>
                            </blockquote>

                            <div className="space-y-3">
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <div className="h-px w-12 bg-primary"></div>
                                    <span className="font-semibold text-lg text-gray-900">CEO, Foluxe Manufacturing Concepts</span>
                                </div>
                                <div className="text-gray-500 font-medium">Digital Creator</div>
                                <div className="inline-flex items-center gap-2 text-sm text-gray-400 uppercase tracking-widest pt-2">
                                    <Globe className="w-4 h-4" />
                                    Lagos, Nigeria
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            The principles that guide our reporting and analysis.
                        </p>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Integrity",
                                desc: "Unbiased, fact-checked reporting you can trust. We adhere to the highest standards of journalistic ethics."
                            },
                            {
                                icon: Zap,
                                title: "Innovation",
                                desc: "Focusing on the technologies and breakthroughs that are redefining what's possible in chemistry."
                            },
                            {
                                icon: Globe,
                                title: "Global Perspective",
                                desc: "Connecting local market nuances with global economic trends to provide a complete picture."
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                className="bg-white p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Partner With Us</h2>
                    <p className="text-lg text-muted-foreground mb-10">
                        Whether you're looking to advertise to a targeted audience or share your latest corporate milestone, Chemical Business Reports is your platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href="https://wa.me/2348021128845"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-white shadow transition-colors hover:bg-primary/90"
                        >
                            Contact Us
                        </a>
                        <Link
                            href="/posts"
                            className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-transparent px-8 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            Read Latest News
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
