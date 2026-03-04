"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FireEffect from "./FireEffect";
import InteractiveStack from "./InteractiveStack";

export default function CollectionFeature() {
    return (
        <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left: Automated Stacked Cards */}
                <div className="relative order-2 lg:order-1 w-full flex justify-center lg:justify-start">
                    <InteractiveStack />
                </div>

                {/* Right: Content */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-center lg:text-left order-1 lg:order-2"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-syne font-bold mb-6 md:mb-10 leading-tight">
                        High Quality NFT Collections
                    </h2>

                    <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                        <p className="text-white/40 text-xs md:text-sm leading-relaxed font-space max-w-xl mx-auto lg:mx-0">
                            Our goal is to provide customized solutions to assist your company in meeting its energy goals. We have a team of consultants, installers, and engineers who have been dedicated.
                        </p>
                        <p className="text-white/40 text-xs md:text-sm leading-relaxed font-space hidden sm:block max-w-xl mx-auto lg:mx-0">
                            Eam of consultants, installers, and engineers eam of consultants, installers, and engineers eam of consultants, installers, and engineers. We have a team of consultants, installers, and engineers who have been dedicated.
                        </p>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-8 md:mb-12">
                        <span className="text-2xl md:text-3xl font-bold font-syne">210k+</span>
                        <div className="w-px h-6 bg-white/20 transform -skew-x-[25deg]" />
                        <span className="text-[9px] md:text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold">NFT DETAIL</span>
                    </div>

                    <button className="poly-button font-syne text-base md:text-lg uppercase tracking-wider mx-auto lg:mx-0">
                        Read More
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
