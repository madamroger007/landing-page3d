"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Particle {
    id: string;
    x: number;
    y: number;
    color: string;
}

export default function CustomCursor() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const { clientX, clientY } = e;
        setMousePos({ x: clientX, y: clientY });

        // Detect if hovering over interactive elements
        const element = document.elementFromPoint(clientX, clientY);
        const isInteractive = element?.closest('a, button, input, [role="button"]');
        setIsHovering(!!isInteractive);

        // Add particles on move with unique IDs
        const id = `${Date.now()}-${Math.random()}`;
        const newParticle: Particle = {
            id,
            x: clientX,
            y: clientY,
            color: Math.random() > 0.5 ? "#00d2ff" : "#e1ff01",
        };

        setParticles((prev) => [...prev.slice(-15), newParticle]);
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Particle Trail */}
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 1, scale: 1, x: p.x, y: p.y }}
                        animate={{
                            opacity: 0,
                            scale: 0,
                            y: p.y + (Math.random() - 0.5) * 40,
                            x: p.x + (Math.random() - 0.5) * 40
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute w-1.5 h-1.5 rounded-full blur-[1px]"
                        style={{ backgroundColor: p.color }}
                    />
                ))}
            </AnimatePresence>

            {/* Main Rocket Cursor */}
            <motion.div
                className="absolute w-14 h-14 -ml-7 -mt-7"
                animate={{
                    x: mousePos.x,
                    y: mousePos.y,
                    scale: isHovering ? 1.3 : 1,
                    rotate: (mousePos.x % 10) - 5
                }}
                transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 400,
                    mass: 0.3
                }}
            >
                <Image
                    src="/rocket-cursor.png"
                    alt="Rocket Cursor"
                    width={56}
                    height={56}
                    className="object-contain drop-shadow-[0_0_15px_rgba(0,210,255,0.6)]"
                    loading="eager"
                />

                {/* Glow behind rocket when hovering */}
                {isHovering && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-neon-blue/20 blur-xl rounded-full -z-10"
                    />
                )}
            </motion.div>
        </div>
    );
}
