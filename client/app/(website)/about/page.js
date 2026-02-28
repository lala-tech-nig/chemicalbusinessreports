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
                            At Chemical Business Reports, we believe that accurate reporting of events is the
                            catalyst for the industry's growth and progress.
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
                            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                As the premier source of the industry’s critical market insights, innovation
                                trends, and corporate intelligence, we aim to empower industry leaders to make datadriven decisions that shape the future.
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
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                        {/* Image Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="relative w-full max-w-[400px] aspect-[4/5] flex-shrink-0"
                        >
                            <div className="absolute -inset-4 bg-primary/5 rounded-[40px] -z-10 rotate-3" />
                            <div className="absolute -inset-4 border-2 border-primary/10 rounded-[40px] -z-10 -rotate-3" />
                            <div className="relative h-full w-full rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
                                <Image
                                    src="/foluxe.jpeg"
                                    alt="Foluso Olorunfemi"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* Stats/Badge */}
                            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-border hidden md:block">
                                <div className="text-3xl font-bold text-primary">30+</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Years Experience</div>
                            </div>
                        </motion.div>

                        {/* Content Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="flex-1"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                Meet the Founder/Publisher
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 leading-tight">
                                Foluso Olorunfemi
                            </h2>

                            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p>
                                    Foluso Olorunfemi is a seasoned and experienced <span className="text-gray-900 font-semibold">Product Development Chemist</span> who holds a Bachelor of Science (Honours) degree in Biochemistry from Nigeria’s premier university, <span className="text-primary italic">University of Ibadan</span>.
                                </p>

                                <p className="bg-white p-6 rounded-2xl border-l-4 border-primary shadow-sm text-gray-800 font-medium italic">
                                    "He has extensive knowledge of the formulation, production, and application of a wide range of chemical products."
                                </p>

                                <div className="space-y-4">
                                    <p>
                                        Foluso Olorunfemi has been engaged in the cosmetics & personal care sector of the chemical industry for <span className="text-gray-900 font-bold underline decoration-primary lg:decoration-2">over 30 years</span>, specialising in production, product development, and marketing research.
                                    </p>
                                    <p>
                                        Most of his practical knowledge was gained through work experience and business relationships with leading indigenous manufacturers; these experiences have provided him with valuable insights into the industry's potential and challenges.
                                    </p>
                                    <p className="text-gray-900 font-medium">
                                        He is best placed to use his vast knowledge of the industry to promote and advocate for appropriate policy direction for its growth and development.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center gap-6 pt-10 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Lagos, Nigeria</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Industry Advocate</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Team Section */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">Our Dedicated Team</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                                A multidisciplinary team of seasoned professionals committed to industry excellence and data-driven intelligence.
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            {
                                name: "Foluso Olorunfemi",
                                role: "Publisher",
                                image: "/foluxe.jpeg",
                                initials: "FO"
                            },
                            {
                                name: "Seun Oluwanya",
                                role: "Business Development Manager",
                                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
                                initials: "SO"
                            },
                            {
                                name: "Princess Adeola Shittu",
                                role: "Marketing Consultant",
                                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
                                initials: "PS"
                            },
                            {
                                name: "Chidi Orazulike",
                                role: "Editorial Consultant",
                                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
                                initials: "CO"
                            },
                            {
                                name: "LALA TECH",
                                role: "IT Consultant",
                                image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=800&auto=format&fit=crop",
                                initials: "LT"
                            },
                            {
                                name: "Deji Olabiwonnu",
                                role: "Legal Adviser",
                                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
                                initials: "DO"
                            }
                        ].map((member, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                className="group relative bg-white rounded-[32px] p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-primary/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                                    <div className="relative h-full w-full rounded-full overflow-hidden border-4 border-white shadow-md">
                                        {member.image ? (
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-2xl">
                                                {member.initials}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-1">{member.name}</h3>
                                <p className="text-primary/70 font-semibold text-sm uppercase tracking-wider mb-4">{member.role}</p>

                                <div className="flex justify-center gap-3 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gray-50/50">
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
                        Use the following contact information to reach us. Alternatively, you can fill out the
                        form to tell us about your specific need, and our marketing staff will get back to you
                        promptly.
                        Telephone: +2348021128845, +2348142135297.
                        Email: info@chemicalbusinessreports.net, coslab.media@gmail.com.
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
