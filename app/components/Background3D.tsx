"use client";

import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, PerspectiveCamera, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function CursorHaze() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const lightRef = useRef<THREE.PointLight>(null!);
    const { mouse, viewport } = useThree();

    useFrame(() => {
        // Map mouse position to 3D world coordinates
        const x = (mouse.x * viewport.width) / 2;
        const y = (mouse.y * viewport.height) / 2;

        if (meshRef.current) {
            meshRef.current.position.set(x, y, 0);
        }
        if (lightRef.current) {
            lightRef.current.position.set(x, y, 2);
        }
    });

    return (
        <>
            <pointLight
                ref={lightRef}
                intensity={2}
                distance={15}
                color="#00d2ff"
            />
            <mesh ref={meshRef}>
                <planeGeometry args={[10, 10]} />
                <MeshDistortMaterial
                    color="#00d2ff"
                    speed={2}
                    distort={0.4}
                    radius={1}
                    opacity={0.08}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    );
}

function InteractiveStars() {
    const starsRef = useRef<THREE.Points>(null!);
    const { mouse } = useThree();

    useFrame(() => {
        if (starsRef.current) {
            const targetX = -mouse.x * 2;
            const targetY = -mouse.y * 2;

            starsRef.current.position.x = THREE.MathUtils.lerp(starsRef.current.position.x, targetX, 0.05);
            starsRef.current.position.y = THREE.MathUtils.lerp(starsRef.current.position.y, targetY, 0.05);

            starsRef.current.rotation.y += 0.0005;
            starsRef.current.rotation.x += 0.0002;
        }
    });

    return (
        <group ref={starsRef as any}>
            <Stars
                radius={100}
                depth={50}
                count={7000}
                factor={4}
                saturation={0}
                fade
                speed={1.5}
            />
        </group>
    );
}

function Scene() {
    const scrollRef = useRef(0);
    const { mouse } = useThree();

    useFrame(() => {
        const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        scrollRef.current = THREE.MathUtils.lerp(scrollRef.current, scrollY, 0.05);
    });

    return (
        <group position={[0, scrollRef.current * 0.01, 0]}>
            <InteractiveStars />
            <CursorHaze />

            <pointLight position={[5, 5, 5]} intensity={1} color="#9d50bb" />
            <pointLight position={[-5, -5, 5]} intensity={1} color="#00d2ff" />
        </group>
    );
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 -z-50 pointer-events-none bg-[#020208]">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={50} />
                <ambientLight intensity={0.5} />

                <Scene />

                <fog attach="fog" args={["#020208", 20, 60]} />
            </Canvas>

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
        </div>
    );
}
