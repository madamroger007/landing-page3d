"use client";

import React from "react";

export default function Web3Background() {
    return (
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
            {/* Base Deep Space Gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(180deg, #0B0F2F 0%, #0A1A4F 40%, #07123A 70%, #020617 100%)`
                }}
            />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-web3-grid opacity-60" />

            {/* Depth Blobs */}
            <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-neon-blue/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute top-[40%] right-[5%] w-[500px] h-[500px] bg-neon-purple/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[10%] left-[15%] w-[700px] h-[700px] bg-neon-blue/5 blur-[200px] rounded-full" />

            {/* Subtle Scanline / Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
