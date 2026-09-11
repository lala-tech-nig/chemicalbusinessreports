"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
    Handshake,
    Trophy,
    ShieldCheck,
    Search,
    ExternalLink,
    Calendar,
    Building2,
    CheckCircle2,
    Sparkles,
    Eye,
    X,
    ChevronRight,
    MapPin,
    ArrowUpRight,
    Send,
    FileCheck2,
    Quote,
    Layers,
    Share2,
    Check,
} from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// DATA REPOSITORY: AWARDS, PARTNERS, TROPHIES & CERTIFICATIONS
// ─────────────────────────────────────────────────────────────

const RECOGNITION_DATA = [
    // ── AWARDS ──
    {
        id: "award-1",
        category: "awards",
        title: "Excellence in Chemical Journalism Award",
        subtitle: "West African Energy & Chemical Press Laurels",
        year: "2024",
        issuer: "West African Chemical Press Association (WACPA)",
        location: "Accra, Ghana",
        image: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Gold Laureate",
        citation: "Awarded for exceptional investigative reporting on regional polymer supply chain disruptions, circular plastics sustainability, and accurate chemical market pricing indices.",
        criteria: "Investigative Rigor • Market Impact • Scientific Integrity",
        details: "Conferred during the 14th Annual Petrochemical Press Summit. The editorial board was recognized for producing over 150 deeply researched market analyses.",
    },
    {
        id: "award-2",
        category: "awards",
        title: "Top Industrial Trade Publication of the Year",
        subtitle: "African Chemical Manufacturers Guild",
        year: "2023",
        issuer: "Federation of African Industrial Chemists (FAIC)",
        location: "Nairobi, Kenya",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Annual Grand Winner",
        citation: "In recognition of outstanding journalism bridging the gap between chemical research, industrial plant manufacturing, and macroeconomic policy across Sub-Saharan Africa.",
        criteria: "Editorial Depth • Cross-Sector Reach • Industry Consensus",
        details: "Selected unanimously by a jury of chemical engineering deans and corporate manufacturing directors across 12 countries.",
    },
    {
        id: "award-3",
        category: "awards",
        title: "Scientific Media Innovation & Thesis Discourse Prize",
        subtitle: "Pan-African Science & Technology Forum",
        year: "2024",
        issuer: "Pan-African Science Council (PASC)",
        location: "Lagos, Nigeria",
        image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Innovation Laureate",
        citation: "Honoring CBR's ChemTalk initiative for providing an open, high-impact digital forum connecting academic chemical researchers, postgraduate thesis writers, and industry practitioners.",
        criteria: "Digital Innovation • Academic Empowerment • Open Access",
        details: "Recognized as the premier open-access platform transforming academic thesis publications into commercially viable chemical manufacturing intelligence.",
    },
    {
        id: "award-4",
        category: "awards",
        title: "Outstanding Green Chemistry & Sustainability Coverage",
        subtitle: "Global EcoChem Environmental Media Laurels",
        year: "2023",
        issuer: "Global EcoChem Alliance & Environmental Media Hub",
        location: "Geneva, Switzerland",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Sustainability Honor",
        citation: "For sustained dedication to reporting on biodegradable polymers, non-toxic agrochemical synthesis, and industrial decarbonization pathways.",
        criteria: "Environmental Impact • Technical Precision • Sustainable Vision",
        details: "Celebrated for the 6-part investigative series 'The Green Reagent' spotlighting zero-effluent manufacturing processes.",
    },

    // ── PARTNERS ──
    {
        id: "partner-1",
        category: "partners",
        title: "Chemical Society of Nigeria (CSN)",
        subtitle: "Apex Professional Body for Chemical Sciences",
        tier: "Strategic Academic Partner",
        tierColor: "blue",
        year: "Est. 2018",
        issuer: "CSN National Executive Secretariat",
        location: "Abuja, Nigeria",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Apex Body Affiliate",
        website: "https://chemsociety.org.ng",
        citation: "Joint collaboration on peer-reviewed thesis disseminations, national conference media partnerships, and continuing chemical education symposiums.",
        focusAreas: ["Academic Theses Verification", "Annual Conference Coverage", "Technical Peer Review"],
        details: "Chemical Business Reports serves as an accredited media dissemination channel for CSN research papers, annual chemistry week celebrations, and regional branch bulletins.",
    },
    {
        id: "partner-2",
        category: "partners",
        title: "Manufacturers Association of Nigeria (MAN)",
        subtitle: "Chemical, Paints & Petrochemicals Sectoral Group",
        tier: "Trade & Commerce Alliance",
        tierColor: "emerald",
        year: "Est. 2020",
        issuer: "MAN Industrial Directorate",
        location: "Ikeja, Lagos",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Industrial Alliance",
        website: "https://manufacturersnigeria.org",
        citation: "Institutional data sharing alliance delivering quarterly production indices, raw material import pricing tariffs, and factory energy audit analyses.",
        focusAreas: ["Raw Material Price Indices", "Supply Chain Intelligence", "Policy Advocacy Reporting"],
        details: "Collaborative publishing on factory-floor innovation, raw material sourcing challenges, and local manufacturing value-addition metrics.",
    },
    {
        id: "partner-3",
        category: "partners",
        title: "Department of Chemical Engineering, UNILAG",
        subtitle: "University of Lagos Center of Chemical Excellence",
        tier: "Research & Theses Consortia",
        tierColor: "purple",
        year: "Est. 2021",
        issuer: "UNILAG Faculty of Engineering",
        location: "Akoka, Lagos",
        image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Academic Research",
        website: "https://unilag.edu.ng",
        citation: "Facilitating postgraduate thesis exposure, doctoral candidate publication grants, and collaborative laboratory case study documentation.",
        focusAreas: ["Master's & PhD Theses", "Lab-to-Market Incubator", "Process Engineering Studies"],
        details: "Provides direct publishing pathways on ChemTalk for university researchers to showcase validated pilot-plant models and chemical process simulations.",
    },
    {
        id: "partner-4",
        category: "partners",
        title: "West African Petrochemical & Refining Forum",
        subtitle: "Regional Hydrocarbon & Derivatives Network",
        tier: "Industry Vanguard",
        tierColor: "amber",
        year: "Est. 2022",
        issuer: "WAPRF Steering Committee",
        location: "Port Harcourt & Accra",
        image: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Energy Vanguard",
        website: "#",
        citation: "Strategic intelligence partnership monitoring downstream catalytic cracking, polypropylene output, and cross-border petroleum derivatives trade.",
        focusAreas: ["Refinery Operations Data", "Catalysis Research", "West African Cross-Border Trade"],
        details: "Jointly publishes the annual 'West Africa Downstream Chemicals Outlook', tracking refining capacity and specialty chemical blends across ECOWAS.",
    },

    // ── TROPHIES ──
    {
        id: "trophy-1",
        category: "trophies",
        title: "The Golden Retort Cup - 2024",
        subtitle: "Grand Laurels of Science Reporting & Chemical Integrity",
        year: "2024",
        issuer: "International Chemical Media Guild (ICMG)",
        location: "Johannesburg, South Africa",
        image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Champion Cup",
        citation: "Bestowed upon Chemical Business Reports for pioneering authoritative market analyses, investigative industrial exposés, and unwavering accuracy.",
        inscription: "Presented to Chemical Business Reports for Unrivaled Depth in Chemical Market Intelligence and Scientific Integrity • 2024",
        metalTier: "Gold Plate & Solid Walnut Pedestal",
        details: "Standing 48cm tall with hand-engraved brass filigree, The Golden Retort Cup is awarded once every three years to Africa's leading chemical publication.",
    },
    {
        id: "trophy-2",
        category: "trophies",
        title: "Continental Energy & Refining Media Trophy",
        subtitle: "Downstream Petrochemical Intelligence Prize",
        year: "2023",
        issuer: "African Downstream Refining & Petrochemical Congress",
        location: "Luanda, Angola",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Congress Plaque",
        citation: "Recognizing outstanding technical depth in refinery optimization, catalyst technology reporting, and petrochemical feedstock pricing.",
        inscription: "Honoring Tenacious Petrochemical Investigative Journalism & Downstream Transparency • ADRPC 2023",
        metalTier: "Brushed Bronze & Obsidian Base",
        details: "An iconic cast-bronze sculpture representing molecular bonding, presented at the gala banquet before 800 energy executives.",
    },
    {
        id: "trophy-3",
        category: "trophies",
        title: "Chemical Society Innovation Vanguard Trophy",
        subtitle: "Nigerian Council for Chemical Enterprise",
        year: "2022",
        issuer: "National Chemical Innovation Assembly",
        location: "Ibadan, Nigeria",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Vanguard Trophy",
        citation: "For relentless commitment to showcasing home-grown chemical formulations, indigenous soap & cosmetics innovation, and local active pharmaceutical ingredients.",
        inscription: "For Driving Industrial Self-Reliance and Championing Indigenous Chemical Science • 2022",
        metalTier: "Polished Nickel-Silver & Teak",
        details: "Presented in recognition of CBR's extensive coverage of local raw-material substitution across paint, agrochemical, and beverage industries.",
    },

    // ── CERTIFICATIONS & ACCREDITATIONS ──
    {
        id: "cert-1",
        category: "certifications",
        title: "ISO 9001:2015 Information Quality Compliance",
        subtitle: "Audited Editorial & Market Data Integrity Standard",
        year: "Certified 2023 - 2026",
        issuer: "International Quality Accreditation Syndicate",
        location: "International Register",
        image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
        badgeText: "ISO Certified",
        certNumber: "ISO-CBR-9001-QA-2023-889",
        citation: "Independently audited and certified for maintaining rigorous data verification protocols, unbiased price assessments, and transparent corrections policy.",
        status: "Active & Verified",
        validity: "Valid through December 2026",
        details: "Ensures all market price indices, chemical supply reports, and statistical benchmarks meet international trade information fidelity benchmarks.",
    },
    {
        id: "cert-2",
        category: "certifications",
        title: "Federation of African Science Journalists Accreditation",
        subtitle: "Official Continental Press & Media Credential",
        year: "Renewed 2024",
        issuer: "Federation of African Science Journalists (FASJ)",
        location: "Continental Secretariat",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
        badgeText: "Press Accredited",
        certNumber: "FASJ-NIG-CBR-2024-0041",
        citation: "Full press accreditation for verified reporting at international chemical conventions, academic symposia, and governmental chemical policy hearings.",
        status: "Fully Accredited",
        validity: "Annual Renewal • In Good Standing",
        details: "Authorizes CBR correspondents to access restricted industrial sites, laboratory facilities, and ministerial briefings across 28 member states.",
    },
];

// ─────────────────────────────────────────────────────────────
// CATEGORY CONFIGURATIONS & STYLING TOKENS
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
    {
        id: "all",
        label: "All Honors & Recognition",
        shortLabel: "All",
        icon: Layers,
        count: RECOGNITION_DATA.length,
        description: "Explore the comprehensive showcase of awards, institutional partners, trophies, and certifications.",
    },
    {
        id: "awards",
        label: "Awards & Laurels",
        shortLabel: "Awards",
        icon: Award,
        count: RECOGNITION_DATA.filter((i) => i.category === "awards").length,
        description: "Prestigious honors, media prizes, and scientific journalism citations received by Chemical Business Reports.",
    },
    {
        id: "partners",
        label: "Partners & Alliances",
        shortLabel: "Partners",
        icon: Handshake,
        count: RECOGNITION_DATA.filter((i) => i.category === "partners").length,
        description: "Strategic industrial bodies, academic institutions, and trade consortia driving chemical progress with us.",
    },
    {
        id: "trophies",
        label: "Trophies & Accolades",
        shortLabel: "Trophies",
        icon: Trophy,
        count: RECOGNITION_DATA.filter((i) => i.category === "trophies").length,
        description: "Physical cups, engraved plaques, and commemorative laurels won across regional and international summits.",
    },
    {
        id: "certifications",
        label: "Certifications & Seals",
        shortLabel: "Certifications",
        icon: ShieldCheck,
        count: RECOGNITION_DATA.filter((i) => i.category === "certifications").length,
        description: "Audited quality standards, editorial verifications, and professional press council accreditations.",
    },
];

export default function AwardsAndPartnersPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [partnerModalOpen, setPartnerModalOpen] = useState(false);
    const [partnerForm, setPartnerForm] = useState({
        name: "",
        organization: "",
        email: "",
        type: "Strategic Industry Partner",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    // Filter items based on active category & search
    const filteredItems = useMemo(() => {
        return RECOGNITION_DATA.filter((item) => {
            const matchesCategory = activeCategory === "all" || item.category === activeCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.subtitle.toLowerCase().includes(q) ||
                item.issuer.toLowerCase().includes(q) ||
                (item.location && item.location.toLowerCase().includes(q)) ||
                (item.citation && item.citation.toLowerCase().includes(q)) ||
                (item.year && item.year.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    const activeCatObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

    const handleShare = (item) => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${item.title} - Chemical Business Reports: ${url}`);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handlePartnerSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setPartnerModalOpen(false);
            setPartnerForm({ name: "", organization: "", email: "", type: "Strategic Industry Partner", message: "" });
            toast.success("Thank you! Your partnership inquiry has been received. Our executive director will contact you promptly.");
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 pt-20 pb-28">
            {/* ─────────────────────────────────────────────────────────────
                HERO SECTION (Clean, Solid Slate Navy, No Gradient)
            ───────────────────────────────────────────────────────────── */}
            <section className="bg-slate-900 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-5 border border-blue-400/30">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                Excellence, Credibility & Partnerships
                            </div>
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-5">
                                Awards, Trophies & Strategic Partners
                            </h1>
                            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                                Chemical Business Reports is recognized across Africa and globally for editorial rigor, transparent market intelligence, and deep partnerships with leading chemical institutions.
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => setPartnerModalOpen(true)}
                                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-600/30 flex items-center gap-2"
                                >
                                    <Handshake className="w-4 h-4" />
                                    Partner With Us
                                </button>
                                <a
                                    href="#directory"
                                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors border border-slate-700 flex items-center gap-2"
                                >
                                    Explore Directory
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </a>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-center min-w-[140px] sm:min-w-[160px]">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-white">4+</div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Prestigious Awards</div>
                            </div>

                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-center min-w-[140px] sm:min-w-[160px]">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                                    <Handshake className="w-5 h-5" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-white">12+</div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Corporate Partners</div>
                            </div>

                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-center min-w-[140px] sm:min-w-[160px]">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-2">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-white">3+</div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Industry Trophies</div>
                            </div>

                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-center min-w-[140px] sm:min-w-[160px]">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">ISO & Press Verified</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
                CONTROLS & CATEGORY SELECTOR BAR
            ───────────────────────────────────────────────────────────── */}
            <div id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, year, issuer or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Search count indicator */}
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                            <span>Showing <strong className="text-blue-600">{filteredItems.length}</strong> items</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-slate-400">Category-Specific Custom Layouts</span>
                        </div>
                    </div>

                    {/* Category Filter Buttons */}
                    <div className="flex flex-wrap gap-2.5 pt-5 mt-5 border-t border-slate-100">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                        isSelected
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500"}`} />
                                    <span>{cat.label}</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                                            isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                                        }`}
                                    >
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section Header Notice */}
                <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                        <activeCatObj.icon className="w-6 h-6 text-blue-600" />
                        {activeCatObj.label}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                        {activeCatObj.description}
                    </p>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    DYNAMIC RENDERING IN DEDICATED STYLES PER CATEGORY
                ───────────────────────────────────────────────────────────── */}
                {filteredItems.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-lg mx-auto">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Matching Honors Found</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            No entries match "{searchQuery}" under the selected category. Try a different keyword or reset filters.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setActiveCategory("all");
                            }}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* If ALL is active, group by category or render appropriate card styles */}
                        <div className="space-y-16">
                            {/* ── 1. AWARDS SECTION (PRESTIGE GOLD / CITATION STYLE) ── */}
                            {(activeCategory === "all" || activeCategory === "awards") && (
                                <AwardsSection
                                    items={filteredItems.filter((i) => i.category === "awards")}
                                    onSelect={setSelectedItem}
                                    showHeading={activeCategory === "all"}
                                />
                            )}

                            {/* ── 2. PARTNERS SECTION (CORPORATE ENTERPRISE STYLE) ── */}
                            {(activeCategory === "all" || activeCategory === "partners") && (
                                <PartnersSection
                                    items={filteredItems.filter((i) => i.category === "partners")}
                                    onSelect={setSelectedItem}
                                    showHeading={activeCategory === "all"}
                                />
                            )}

                            {/* ── 3. TROPHIES SECTION (PEDESTAL / ENGRAVED PLAQUE STYLE) ── */}
                            {(activeCategory === "all" || activeCategory === "trophies") && (
                                <TrophiesSection
                                    items={filteredItems.filter((i) => i.category === "trophies")}
                                    onSelect={setSelectedItem}
                                    showHeading={activeCategory === "all"}
                                />
                            )}

                            {/* ── 4. CERTIFICATIONS SECTION (FORMAL CREDENTIAL STYLE) ── */}
                            {(activeCategory === "all" || activeCategory === "certifications") && (
                                <CertificationsSection
                                    items={filteredItems.filter((i) => i.category === "certifications")}
                                    onSelect={setSelectedItem}
                                    showHeading={activeCategory === "all"}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                CALL TO ACTION: PARTNERSHIP INVITATION BANNER
            ───────────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden border border-slate-800">
                    <div className="max-w-2xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-400/30">
                            <Handshake className="w-3.5 h-3.5 text-blue-300" />
                            Collaborate With CBR
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
                            Expand Your Reach in the Global Chemical Ecosystem
                        </h3>
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                            Are you a chemical producer, university research department, trade body, or technology supplier? Partner with Chemical Business Reports for joint research dossiers, thesis publications on ChemTalk, and executive symposiums.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setPartnerModalOpen(true)}
                                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-600/30 flex items-center gap-2"
                            >
                                Initiate Partnership
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                            <Link
                                href="/about"
                                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors border border-slate-700"
                            >
                                Learn More About CBR
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                LIGHTBOX MODAL: FULL DETAILS & HIGH-RES PREVIEW
            ───────────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute right-4 top-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Image Header */}
                            <div className="relative h-64 sm:h-72 w-full bg-slate-900">
                                <img
                                    src={selectedItem.image}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                <div className="absolute bottom-4 left-6 right-6">
                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white inline-block mb-2">
                                        {selectedItem.badgeText || selectedItem.category}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                                        {selectedItem.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                                        {selectedItem.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-6 sm:p-8 space-y-5">
                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-blue-600" />
                                        <strong className="text-slate-800">{selectedItem.issuer}</strong>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {selectedItem.year && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {selectedItem.year}
                                            </span>
                                        )}
                                        {selectedItem.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {selectedItem.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Citation or Main Description */}
                                {selectedItem.citation && (
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
                                        <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-wider mb-2">
                                            <Quote className="w-4 h-4 text-amber-600" />
                                            Official Citation / Partnership Scope
                                        </div>
                                        <p className="text-sm text-slate-700 italic leading-relaxed">
                                            "{selectedItem.citation}"
                                        </p>
                                    </div>
                                )}

                                {/* Specific fields */}
                                {selectedItem.criteria && (
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                            Evaluation Criteria
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {selectedItem.criteria}
                                        </span>
                                    </div>
                                )}

                                {selectedItem.focusAreas && (
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                            Collaborative Focus Areas
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedItem.focusAreas.map((f, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold"
                                                >
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedItem.inscription && (
                                    <div className="p-4 rounded-2xl bg-slate-900 text-amber-300 font-mono text-xs border border-amber-500/40">
                                        <span className="text-[10px] text-slate-400 block uppercase font-sans mb-1">
                                            Engraved Trophy Inscription:
                                        </span>
                                        "{selectedItem.inscription}"
                                    </div>
                                )}

                                {selectedItem.certNumber && (
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                        <span className="font-medium text-slate-600">Verification Registry ID:</span>
                                        <span className="font-mono font-bold text-slate-900">{selectedItem.certNumber}</span>
                                    </div>
                                )}

                                {selectedItem.details && (
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                            Background & Significance
                                        </span>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {selectedItem.details}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleShare(selectedItem)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
                                        {copied ? "Copied!" : "Share Citation"}
                                    </button>

                                    {selectedItem.website && selectedItem.website !== "#" && (
                                        <a
                                            href={selectedItem.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors flex items-center gap-2"
                                        >
                                            Visit Partner Site
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}

                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors ml-auto"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─────────────────────────────────────────────────────────────
                PARTNERSHIP APPLICATION MODAL
            ───────────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {partnerModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8"
                        >
                            <button
                                onClick={() => setPartnerModalOpen(false)}
                                className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Handshake className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Partner With CBR</h3>
                                    <p className="text-xs text-slate-500">Initiate an academic, industrial or media alliance</p>
                                </div>
                            </div>

                            <form onSubmit={handlePartnerSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Your Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Prof. Shamsudeen Yinka"
                                        value={partnerForm.name}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Organization / Academic Institution
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Chemical Society of Nigeria or Petrochem Ltd"
                                        value={partnerForm.organization}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, organization: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Official Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="corporate@domain.com"
                                        value={partnerForm.email}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Partnership Type
                                    </label>
                                    <select
                                        value={partnerForm.type}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, type: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                    >
                                        <option value="Strategic Industry Partner">Strategic Industry Manufacturer</option>
                                        <option value="Academic Research & Theses">University / Academic Research Consortia</option>
                                        <option value="Trade & Professional Council">Trade Body / Professional Association</option>
                                        <option value="Market Data Provider">Chemical Market Data Provider</option>
                                        <option value="Media & Conference Partnership">Media & Conference Endorsement</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Brief Proposal / Inquiries
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Tell us about your organization and how you'd like to collaborate..."
                                        value={partnerForm.message}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, message: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setPartnerModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {submitting ? "Submitting..." : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Submit Inquiry
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 1: AWARDS SECTION (LUXURY GOLD & CITATION STYLE)
// ─────────────────────────────────────────────────────────────
function AwardsSection({ items, onSelect, showHeading }) {
    if (!items || items.length === 0) return null;

    return (
        <section>
            {showHeading && (
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Prestigious Awards & Laurels</h3>
                        <p className="text-xs text-slate-500">Journalism excellence, technical reporting, and scientific media awards</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl overflow-hidden border-2 border-amber-100/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all flex flex-col group"
                    >
                        {/* Image Showcase */}
                        <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                            {/* Gold Laureate Ribbon */}
                            <div className="absolute top-4 left-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                                    <Sparkles className="w-3 h-3 text-slate-950" />
                                    {item.badgeText}
                                </span>
                            </div>

                            {/* Year Pill */}
                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900/80 text-amber-300 border border-amber-400/40 backdrop-blur-sm">
                                    {item.year}
                                </span>
                            </div>

                            {/* Title overlay on bottom of image */}
                            <div className="absolute bottom-4 left-5 right-5">
                                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                                    {item.issuer}
                                </span>
                                <h4 className="text-lg font-black text-white leading-snug drop-shadow-md">
                                    {item.title}
                                </h4>
                            </div>
                        </div>

                        {/* Card Body in Prestige Citation Style */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    {item.subtitle} • {item.location}
                                </p>

                                {/* Official Citation Block */}
                                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 relative">
                                    <Quote className="w-6 h-6 text-amber-300/80 absolute right-3 top-3 -z-0" />
                                    <p className="text-xs text-slate-700 italic leading-relaxed relative z-10 font-serif">
                                        "{item.citation}"
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500">
                                    Criteria: <strong className="text-slate-800">{item.criteria}</strong>
                                </span>
                                <button
                                    onClick={() => onSelect(item)}
                                    className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1"
                                >
                                    Inspect Award
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 2: PARTNERS SECTION (CORPORATE ENTERPRISE STYLE)
// ─────────────────────────────────────────────────────────────
function PartnersSection({ items, onSelect, showHeading }) {
    if (!items || items.length === 0) return null;

    return (
        <section>
            {showHeading && (
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        <Handshake className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Institutional Partners & Alliances</h3>
                        <p className="text-xs text-slate-500">Academic consortia, chemical manufacturers guilds, and regulatory councils</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col group"
                    >
                        {/* Header Banner */}
                        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                            {/* Partner Tier Pill */}
                            <div className="absolute top-4 left-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {item.tier}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-sm">
                                    {item.year}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-5 right-5">
                                <h4 className="text-lg font-black text-white leading-tight">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    {item.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Partner Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {item.location} • {item.issuer}
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                    {item.citation}
                                </p>

                                {/* Focus Areas Tags */}
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Joint Initiatives
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.focusAreas?.map((area, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    onClick={() => onSelect(item)}
                                    className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                                >
                                    Explore Alliance
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>

                                {item.website && item.website !== "#" && (
                                    <a
                                        href={item.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                    >
                                        Visit Portal
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 3: TROPHIES SECTION (PEDESTAL & ENGRAVED PLAQUE STYLE)
// ─────────────────────────────────────────────────────────────
function TrophiesSection({ items, onSelect, showHeading }) {
    if (!items || items.length === 0) return null;

    return (
        <section>
            {showHeading && (
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center font-bold">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Industry Trophies & Cups</h3>
                        <p className="text-xs text-slate-500">Commemorative sculptures, champion cups, and engraved brass laurels</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col group relative"
                    >
                        {/* Trophy Image Showcase with Spotlight Lighting */}
                        <div className="relative h-64 w-full overflow-hidden bg-slate-950 flex items-center justify-center p-4">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                            <div className="absolute top-4 left-4">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-lg">
                                    <Trophy className="w-3 h-3" />
                                    {item.year}
                                </span>
                            </div>
                        </div>

                        {/* Engraved Plaque Styling */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-slate-900">
                            <div>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                                    {item.issuer}
                                </span>
                                <h4 className="text-base font-black text-white leading-snug mb-1">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-slate-400 mb-3">
                                    {item.subtitle}
                                </p>

                                {/* Engraved Inscription Box */}
                                {item.inscription && (
                                    <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-200/90 font-mono text-[11px] leading-relaxed shadow-inner">
                                        "{item.inscription}"
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-slate-400 text-[11px]">
                                    {item.metalTier}
                                </span>
                                <button
                                    onClick={() => onSelect(item)}
                                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                                >
                                    View Plaque
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT 4: CERTIFICATIONS (PARCHMENT / CREDENTIAL STYLE)
// ─────────────────────────────────────────────────────────────
function CertificationsSection({ items, onSelect, showHeading }) {
    if (!items || items.length === 0) return null;

    return (
        <section>
            {showHeading && (
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Official Certifications & Press Seals</h3>
                        <p className="text-xs text-slate-500">Audited reporting quality, press accreditations, and ethics standards</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col group p-6 sm:p-8 relative"
                    >
                        {/* Seal Watermark */}
                        <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
                            <ShieldCheck className="w-24 h-24 text-emerald-800" />
                        </div>

                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                                    <FileCheck2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-1">
                                        ● {item.status}
                                    </span>
                                    <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                                        {item.title}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-3">
                            Issued by: <strong className="text-slate-800">{item.issuer}</strong> • {item.location}
                        </p>

                        <p className="text-xs text-slate-600 leading-relaxed mb-5">
                            {item.citation}
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Registry Code:</span>
                                <span className="font-mono font-bold text-slate-800">{item.certNumber}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Validity:</span>
                                <span className="font-medium text-emerald-700">{item.validity}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">
                                {item.year}
                            </span>
                            <button
                                onClick={() => onSelect(item)}
                                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                                Verify Credential
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
