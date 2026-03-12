"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Shovel as Sparkles } from "lucide-react";
import FireEffect from "../FireEffect";
import { useProductContext } from "../../store/context/product/ProductContext";
import { getYouTubeEmbedUrl } from "../../utils/utils";

const categories = ["All", "Social Media", "Product Image", "Poster", "Banner", "Logo Image", "Animation VFX", "Product Video", "Logo Video", "Landing Page", "Asset 2D", "Asset 3D"];


export default function PopularCollection() {
    const [activeTab, setActiveTab] = useState("All");
    const { products } = useProductContext()
    return (
        <div id="collection">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-neon-purple mb-4">
                    <Sparkles className="w-3 h-3" /> Exclusive Drops
                </div>
                <h2 className="text-4xl md:text-6xl font-syne font-bold mb-8">Our Products</h2>
                <div className="w-24 h-1 bg-radial from-neon-blue to-neon-purple mx-auto rounded-full mb-12" />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-20 px-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === cat
                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <h3 className="text-center font-syne font-bold text-xs uppercase tracking-[0.5em] mb-16 text-white/20">All Desain Section</h3>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-10">
                {products.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className={`glass-card rounded-[32px] md:rounded-[40px] p-4 md:p-5 group hover:bg-white/[0.05] transition-all duration-500 border-white/5 ${i < 2 ? "col-span-1 md:col-span-3" : "col-span-1 md:col-span-2"
                            }`}
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[16/9] rounded-[24px] md:rounded-[30px] overflow-hidden mb-6 md:mb-8 group/fire">

                            {item.videoUrl ? (
                                <div className="relative w-full h-full">
                                    <iframe
                                        src={getYouTubeEmbedUrl(item.videoUrl) || "https://www.youtube.com/watch?v=OGc9W-_C9u0"}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <Image
                                    src={item.image || "/hero-nft.png"}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover/fire:scale-110"
                                />
                            )}
                            <div className="absolute inset-0 opacity-0 group-hover/fire:opacity-100 transition-opacity duration-300">
                                <FireEffect />
                            </div>

                            {/* Overlay Glass Info */}
                            <div className="absolute inset-x-4 bottom-4 glass-card py-2 md:py-3 px-4 md:px-5 rounded-xl md:rounded-2xl flex justify-between items-center lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-500 backdrop-blur-2xl bg-black/40">
                                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Bidding Open
                                </div>
                                <div className="text-[9px] md:text-[10px] font-bold text-white/60">02h 45m</div>
                            </div>

                            <div className="absolute top-4 right-4 glass-card p-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-neon-pink group/like cursor-pointer">
                                <Heart className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i % 2 === 0 ? "text-neon-pink fill-neon-pink" : "text-white/40"}`} />
                                <span className="text-[9px] md:text-[10px]">{item.likes}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h3 className="font-syne font-bold text-lg md:text-xl mb-1 group-hover:text-neon-blue transition-colors">{item.name}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-white/30 text-[10px] md:text-xs uppercase tracking-widest">Price</p>
                                    <p className="text-white font-bold text-xs md:text-sm tracking-tight">{item.price}</p>
                                </div>
                            </div>
                            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group-hover:border-white/40">
                                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
