"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
    { value: "55k", label: "Active User" },
    { value: "47k", label: "Artworks" },
    { value: "42k", label: "Available Artist" },
    { value: "42k", label: "NFT Products" },
];

export default function StatsBar() {
    return (
        <div className="py-20 border-y border-white/5 relative bg-white/[0.01]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative flex flex-col items-center md:items-start"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl md:text-5xl font-syne font-bold">{stat.value}</span>
                                {i < stats.length - 1 && (
                                    <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent absolute -right-4 top-1/2 -translate-y-1/2" />
                                )}
                            </div>
                            <span className="text-sm text-white/40 uppercase tracking-widest mt-2">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
