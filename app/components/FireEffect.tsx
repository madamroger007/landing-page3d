"use client";

import React, { useState, useEffect } from "react";

export default function FireEffect() {
    const [mounted, setMounted] = useState(false);
    const [particleStyles, setParticleStyles] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        // Generate random styles only ONCE on the client
        const styles = Array.from({ length: 15 }).map((_, i) => ({
            left: `${Math.random() * 100}%`,
            "--duration": `${0.5 + Math.random() * 1}s`,
            "--delay": `${Math.random() * 1}s`,
            width: `${10 + Math.random() * 20}%`,
            height: `${30 + Math.random() * 40}%`,
            background: i % 2 === 0 ? "#ff4500" : "#ffae00",
        }));
        setParticleStyles(styles);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fire-container">
            {particleStyles.map((style, i) => (
                <div
                    key={i}
                    className="fire-pixel fire-anim"
                    style={style as any}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 via-transparent to-transparent opacity-50" />
        </div>
    );
}
