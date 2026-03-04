"use client";

import React from "react";
import Link from "next/link";
import { Twitter, Instagram, Globe, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="pt-24 pb-12 border-t border-white/5 bg-black/50">
            <div className="container mx-auto px-6 relative">
                <div className="flex flex-col items-center gap-8 md:gap-12 mb-12 md:mb-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-neon-purple to-neon-blue rounded-lg md:rounded-xl flex items-center justify-center">
                            <span className="text-white font-syne font-bold text-lg md:text-xl">N</span>
                        </div>
                        <span className="text-xl md:text-2xl font-syne font-bold text-white group-hover:neon-text transition-all">
                            NFT<span className="text-neon-blue">Space</span>
                        </span>
                    </Link>

                    {/* Social Icons - Dots in middle */}
                    <div className="flex items-center gap-6">
                        {[Twitter, Instagram, Globe, Github].map((Icon, i) => (
                            <Link
                                key={i}
                                href="#"
                                className="w-4 h-4 rounded-full border border-white/20 hover:border-neon-blue hover:bg-neon-blue transition-all"
                                aria-label="Social Link"
                            />
                        ))}
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Bottom links */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 text-[9px] md:text-[10px] text-white/20 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">
                        <div className="flex gap-8 md:gap-12">
                            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                            <Link href="#" className="hover:text-white transition-colors">Telegram</Link>
                        </div>
                        <div className="flex gap-8 md:gap-12">
                            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}
