"use client";

import React from "react";
import { Send, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Newsletter() {
    return (
        <div>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card rounded-[60px] p-16 md:p-32 text-center relative overflow-hidden bg-white/[0.01] border-white/5"
            >
                {/* Decorative Background Orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-purple/5 blur-[120px] rounded-full -translate-x-1/4 translate-y-1/4" />

                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-neon-blue mb-8">
                        <Mail className="w-3 h-3" /> Stay Connected
                    </div>

                    <h2 className="text-4xl md:text-6xl font-syne font-bold mb-8 leading-tight">
                        Subscribe To <br />
                        <span className="text-white/40">Get Every Update</span>
                    </h2>

                    <p className="text-white/40 text-sm md:text-lg mb-12 leading-relaxed font-space">
                        Subscribe for get our update fermentum augue sed nisl vulputate sodales imperdiet. Curabitur lorem nibh et. Lectus sagittis laoreet ligula pellentesque sed nunc tristique.
                    </p>

                    <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                        <div className="flex-1 relative group">
                            <input
                                type="email"
                                placeholder="Enter your E-mail address"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 focus:outline-none focus:border-neon-blue/50 transition-all font-space text-white/80 placeholder:text-white/20"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-neon-blue/10 opacity-0 group-focus-within:opacity-100 transition-opacity blur-md -z-10" />
                        </div>

                        <button className="poly-button !px-12 !py-6 group">
                            <span className="flex items-center gap-3">
                                Subscribe <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
