"use client";

import React, { useMemo } from "react";

type FireParticleStyle = React.CSSProperties & {
    [key: `--${string}`]: string;
};

export default function FireEffect() {
    const particleStyles = useMemo<FireParticleStyle[]>(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            left: `${(i * 17) % 100}%`,
            "--duration": `${0.6 + (i % 5) * 0.2}s`,
            "--delay": `${(i % 7) * 0.12}s`,
            width: `${10 + (i % 6) * 3}%`,
            height: `${30 + (i % 5) * 6}%`,
            background: i % 2 === 0 ? "#ff4500" : "#ffae00",
        }));
    }, []);

    return (
        <div className="fire-container">
            {particleStyles.map((style, i) => (
                <div
                    key={i}
                    className="fire-pixel fire-anim"
                    style={style}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 via-transparent to-transparent opacity-50" />
        </div>
    );
}
