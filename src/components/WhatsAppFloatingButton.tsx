"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function WhatsAppFloatingButton() {
    const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Show popup after 2 seconds on page load
        const timer = setTimeout(() => {
            setShowPopup(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!whatsappUrl) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] md:bottom-8 md:right-8">
            {/* Auto-appearing tooltip popup */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={showPopup ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute bottom-10 right-0 mb-4 whitespace-nowrap"
            >
                <div className="relative">
                    {/* Gradient glow background */}
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0 0 15px rgba(0, 210, 255, 0.4)",
                                "0 0 30px rgba(157, 80, 187, 0.5)",
                                "0 0 15px rgba(0, 210, 255, 0.4)",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl blur-lg"
                    />

                    {/* Popup card */}
                    <div className="relative bg-gradient-to-r from-[#00d2ff]/20 to-[#9d50bb]/20 backdrop-blur-xl border border-white/30 rounded-2xl px-4 py-2.5 shadow-2xl shadow-black/40">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={showPopup ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-sm font-semibold text-white/95 flex items-center gap-2"
                        >
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                                className="inline-block w-2 h-2 rounded-full bg-[#00d2ff]"
                            />
                            Chat with us
                        </motion.p>

                        {/* Arrow pointer */}
                        <motion.div
                            animate={showPopup ? { opacity: 1 } : { opacity: 0 }}
                            className="absolute -bottom-2 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#00d2ff]/40"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Glowing background effect */}
            <motion.div
                animate={{
                    boxShadow: [
                        "0 0 20px rgba(0, 210, 255, 0.3)",
                        "0 0 40px rgba(0, 210, 255, 0.5)",
                        "0 0 20px rgba(0, 210, 255, 0.3)",
                    ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-xl opacity-75"
            />

            {/* Main button */}
            <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Contact us on WhatsApp"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-gradient-to-r from-[#00d2ff]/15 to-[#0088cc]/15 px-5 py-3 backdrop-blur-xl shadow-2xl shadow-[#00d2ff]/20 transition-all duration-300 group"
            >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00d2ff]/20 to-[#9d50bb]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />

                {/* Icon with pulse animation */}
                <motion.div
                    className="relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00d2ff] to-[#9d50bb] rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <MessageCircle className="relative h-5 w-5 text-white" />
                </motion.div>


                {/* Shimmer effect on hover */}
                <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    whileHover={{ x: "100%", opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 pointer-events-none"
                />
            </motion.a>
        </div>
    );
}