"use client";
import { motion } from "framer-motion";
import InteractiveStack from "@/src/components/card/InteractiveStack";
import { useProductContext } from "@/src/store/context/product/ProductContext";

export default function AboutUs() {
    const { products } = useProductContext()
    return (
        <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ">
                {/* Left: Automated Stacked Cards */}
                <div className="relative order-2 lg:order-1 w-full flex justify-center lg:justify-start">
                    <InteractiveStack cards={products} variant="fan" />
                </div>

                {/* Right: Content */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-center lg:text-left order-1 lg:order-2"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-syne font-bold mb-6 md:mb-10 leading-tight">
                        What&apos;s Our Company?
                    </h2>

                    <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                        <p className="text-white/40 text-xs md:text-sm leading-relaxed font-space max-w-xl mx-auto lg:mx-0">
                            Our company is a service improvement design visual for image, video, website and other media. We are a team of designers and developers who are passionate about creating beautiful and effective visual.
                        </p>
                        <p className="text-white/40 text-xs md:text-sm leading-relaxed font-space hidden sm:block max-w-xl mx-auto lg:mx-0">
                            And we are always looking for new opportunities to improve our services and create new experiences for our clients.
                        </p>
                    </div>

                    <button className="poly-button font-syne text-base md:text-lg uppercase tracking-wider mx-auto lg:mx-0 hover:border-b-4 hover:border-neon-blue hover:text-neon-blue transition-colors">
                        Read More
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
