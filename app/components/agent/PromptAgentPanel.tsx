"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Image as ImageIcon, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePromptAgent } from "./usePromptAgent";

export default function PromptAgentPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const { applyPrompt, handleImageUpload, resetCustomizations } = usePromptAgent();

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        applyPrompt(prompt);
        setPrompt("");
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen
                        ? "bg-white text-black rotate-90"
                        : "bg-gradient-to-tr from-neon-purple to-neon-blue text-white hover:scale-110"
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </button>

            {/* Main Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[400px] glass-nav overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neon-blue flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-syne font-bold text-sm">AI Design Agent</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Ready</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={resetCustomizations}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                title="Reset customizations"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Swiper / Chat Style */}
                        <div className="p-6">
                            <p className="text-xs text-white/40 mb-6 leading-relaxed">
                                Describe how you want to customize this landing page. Change colors, text, or upload your own images.
                            </p>

                            <form onSubmit={handleApply} className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g., 'Make it purple themed' or 'Change headline to My Portfolio'"
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 cursor-pointer transition-all active:scale-95">
                                        <ImageIcon className="w-4 h-4 text-neon-blue" />
                                        <span className="text-xs font-bold">Upload Image</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(file);
                                            }}
                                        />
                                    </label>
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 bg-white text-black rounded-xl py-3 font-bold text-xs hover:bg-neon-blue hover:text-white transition-all active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                        Apply Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Footer Tip */}
                        <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
                            <span className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Live Preview Mode</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
