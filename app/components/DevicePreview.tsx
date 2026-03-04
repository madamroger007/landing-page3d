"use client";

import React from "react";
import Image from "next/image";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";

const deviceData = [
    {
        name: "Desktop View",
        image: "/hero-nft.png",
        frameClass: "w-full md:w-[600px] aspect-[16/10] rounded-[24px]",
        innerClass: "rounded-[20px]",
        bezel: "p-2 bg-white/10"
    },
    {
        name: "Tablet View",
        image: "/nft-card-1.png",
        frameClass: "w-[300px] aspect-[3/4] rounded-[32px]",
        innerClass: "rounded-[28px]",
        bezel: "p-3 bg-white/10"
    },
    {
        name: "Mobile View",
        image: "/creator-avatar.png",
        frameClass: "w-[180px] aspect-[9/19] rounded-[40px]",
        innerClass: "rounded-[36px]",
        bezel: "p-3 bg-white/10"
    }
];

export default function DevicePreview() {
    return (
        <div className="overflow-hidden">
            <div className="text-center mb-24">
                <h3 className="text-neon-blue font-syne font-bold text-xs uppercase tracking-[0.5em] mb-4">Responsive Layout</h3>
                <h2 className="text-4xl md:text-6xl font-syne font-bold mb-8">
                    View Of Desain Layout
                </h2>
                <p className="text-white/40 max-w-xl mx-auto font-space text-sm md:text-base">
                    Our design is fully responsive and optimized for any device. Check out how your NFT marketplace looks on different screens.
                </p>
            </div>

            <div className="flex flex-wrap justify-center items-center md:items-end gap-10 md:gap-20">
                {deviceData.map((device, i) => (
                    <motion.div
                        key={device.name}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2, duration: 0.8 }}
                        className="flex flex-col items-center group w-full sm:w-auto"
                    >
                        {/* Device Mockup */}
                        <div className={`relative ${device.frameClass} ${device.bezel} border border-white/10 shadow-2xl glass-card transition-transform duration-500 lg:group-hover:-translate-y-4 mx-auto max-w-[90vw] md:max-w-none`}>
                            <div className={`relative w-full h-full ${device.innerClass} overflow-hidden bg-black`}>
                                <Image
                                    src={device.image}
                                    alt={device.name}
                                    fill
                                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />

                                {/* Overlay Screen Shine */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
                            </div>

                            {/* Device Accents (Buttons/Sensors) */}
                            {device.name === "Mobile View" && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3 sm:h-4 bg-black/80 rounded-full z-10" />
                            )}
                            {device.name === "Tablet View" && (
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1 h-10 sm:h-12 bg-white/20 rounded-full" />
                            )}
                        </div>

                        {/* Label */}
                        <div className="mt-6 md:mt-8 text-center flex flex-col items-center gap-2">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-neon-blue transition-colors">
                                {device.name}
                            </span>
                            <div className="w-8 h-0.5 bg-neon-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Background Decor */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-purple/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-blue/20 blur-[150px] rounded-full" />
            </div>
        </div>
    );
}
