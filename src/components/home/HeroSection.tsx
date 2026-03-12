"use client";
import { motion } from "framer-motion";
import InteractiveStack from "../card/InteractiveStack";
import { useProductContext } from "../../store/context/product/ProductContext";


// ... (stats definition)

const stats = [
    { value: "100+", label: "our consumer" },
    { value: "100+", label: "our image" },
    { value: "100+", label: "our video" },
    { value: "100+", label: "our web" },
];

export default function HeroSection() {
    const { products } = useProductContext();

    return (
        <div className="relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-neon-blue/5 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-neon-purple/5 blur-[80px] md:blur-[120px] rounded-full translate-y-1/2" />

            <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center mb-16 md:mb-24">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >
                        <h1 className="text-4xl md:text-5xl font-syne font-bold leading-[1.1] mb-8 flex flex-wrap items-center justify-center lg:justify-start">
                            <div className="flex items-center gap-2 w-full">
                                <span>ArtWork</span>
                                <div className="slanted-lines mx-4">
                                    <div className="slanted-line" />
                                    <div className="slanted-line opacity-70" />
                                    <div className="slanted-line opacity-40" />
                                </div>
                            </div>
                            <br className="hidden lg:block" />
                            <span>Improve Your Design</span>
                        </h1>

                        <p className="text-white/50 text-sm md:text-base leading-relaxed mb-10 md:mb-12 max-w-xl mx-auto lg:mx-0 font-space">
                            We could help to improve and optimize existing designs by refining layouts, colors, typography, and user interface elements. Our service focuses on creating modern, responsive, and visually appealing designs that enhance usability and user experience
                        </p>

                        <button className="poly-button font-syne text-base md:text-lg uppercase tracking-wider mx-auto lg:mx-0 hover:border-b-4 hover:border-neon-blue hover:text-neon-blue transition-colors">
                            Explore Now
                        </button>

                    </motion.div>

                    {/* Right Content - Automated Stacked Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="flex-1 w-full"
                    >
                        <InteractiveStack cards={products}
                        />
                    </motion.div>
                </div>

                {/* Stats Slider Line */}
                <div className="relative pt-8 md:pt-12">
                    {/* Timeline Line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10" />
                    <div className="absolute top-0 left-[35%] w-3 h-3 bg-neon-blue rounded-full -translate-y-[5px] shadow-[0_0_15px_rgba(0,210,255,0.8)]" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 md:gap-6">
                                <span className="text-2xl md:text-3xl font-syne font-bold">{stat.value}</span>
                                <span className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest max-w-[50px] md:max-w-[60px] leading-tight">{stat.label}</span>
                                {i < stats.length - 1 && (
                                    <div className="h-6 w-[2px] bg-white/10 transform  ml-auto hidden md:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
