"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const services = [
    {
        id: "01",
        title: "Branding",
        image: "/nft-card-1.png",
        detailsTitle: "Branding Services",
        items: ["Identity Design", "Visual Branding", "Brand Marketing", "Brand Strategy"],
    },
    {
        id: "02",
        title: "UI/UX Design",
        image: "/nft-card-1.png",
        detailsTitle: "UI/UX Design",
        items: ["UI Design", "UX Design", "Web & App Design", "Wireframing & Prototyping", "Design Systems"],
    },
    {
        id: "03",
        title: "Web Development",
        image: "/nft-card-1.png",
        detailsTitle: "Development",
        items: ["Front-End Development", "Back-End Development", "Web & App Development", "CMS Integration", "API Integration"],
    },
];

const YELLOW_ACCENT = "#e1ff01";

export default function FeaturesDetail() {
    return (
        <div className="overflow-hidden">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 mb-16 md:mb-24">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: YELLOW_ACCENT }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW_ACCENT }} />
                    Services
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-syne font-medium leading-tight max-w-2xl text-left md:text-right md:ml-auto">
                    <span className="text-white">We Deliver —</span>{" "}
                    <span className="text-white/40">Comprehensive Solutions to help businesses Grow and thrive.</span>
                </h2>
            </div>

            {/* Services List */}
            <div className="space-y-20 md:space-y-32">
                {services.map((service, index) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] items-center gap-10 md:gap-20"
                    >
                        {/* Left: Number and Title */}
                        <div className="flex flex-col gap-4 md:gap-6 text-center lg:text-left items-center lg:items-start">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm"
                                style={{ backgroundColor: YELLOW_ACCENT }}
                            >
                                {service.id}
                            </div>
                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-syne font-bold text-white">
                                {service.title}
                            </h3>
                        </div>

                        {/* Center: Hero Image / Mockup */}
                        <div className="relative group max-w-2xl mx-auto w-full">
                            <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-[24px] md:rounded-[40px] overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-500">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                                />

                                {/* Center Button Appearance */}
                                <div className="absolute inset-0 flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-black font-bold text-[10px] uppercase tracking-tighter shadow-2xl"
                                        style={{ backgroundColor: YELLOW_ACCENT }}
                                    >
                                        <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 mb-1" />
                                        View Details
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Detailed List */}
                        <div className="relative pl-0 lg:pl-12 text-center lg:text-left">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-px bg-white/20 hidden lg:block" />

                            <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-6 text-white">
                                <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: YELLOW_ACCENT }} />
                                {service.detailsTitle}
                            </div>

                            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                                {service.items.map((item, i) => (
                                    <li key={i} className="flex items-center justify-center lg:justify-start gap-3 text-white/40 text-[12px] md:text-sm font-space group cursor-default">
                                        <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-neon-blue transition-colors hidden lg:block" />
                                        <span className="group-hover:text-white transition-colors">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
