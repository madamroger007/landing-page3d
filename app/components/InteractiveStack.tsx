"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FireEffect from "./FireEffect";

interface CardData {
    id: number;
    title: string;
    image: string;
    price: string;
    timeLeft: string;
    likes: string;
}

const defaultCards: CardData[] = [
    {
        id: 1,
        title: "Cyber Mongkey #132",
        image: "/hero-nft.png",
        price: "5 ETH",
        timeLeft: "4 Days left",
        likes: "140"
    },
    {
        id: 2,
        title: "Neon Matrix #45",
        image: "/nft-card-1.png",
        price: "3.2 ETH",
        timeLeft: "2 Days left",
        likes: "85"
    },
    {
        id: 3,
        title: "Future Soul #99",
        image: "/nft-card-1.png",
        price: "4.8 ETH",
        timeLeft: "6 Days left",
        likes: "210"
    }
];

export default function InteractiveStack({ cards = defaultCards }: { cards?: CardData[] }) {
    const [stack, setStack] = useState(cards);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAnimating) {
                swipeCard();
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [isAnimating, stack]);

    const swipeCard = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        setTimeout(() => {
            setStack((prev) => {
                const newStack = [...prev];
                const topCard = newStack.shift()!;
                newStack.push(topCard);
                return newStack;
            });
            setIsAnimating(false);
        }, 800);
    };

    return (
        <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center lg:justify-end">
            <AnimatePresence mode="popLayout">
                {stack.map((card, index) => {
                    // We only want to animate the top card swiping out
                    const isTop = index === 0;

                    return (
                        <motion.div
                            key={card.id}
                            initial={false}
                            animate={{
                                x: index * -30,
                                scale: 1 - index * 0.05,
                                opacity: 1 - index * 0.2,
                                zIndex: stack.length - index,
                            }}
                            exit={isTop ? {
                                x: 300,
                                opacity: 0,
                                scale: 0.8,
                                transition: { duration: 0.6, ease: "easeInOut" }
                            } : undefined}
                            className="absolute w-[240px] sm:w-[280px] md:w-[320px] aspect-[3/4] glass-card rounded-2xl p-4 shadow-2xl"
                        >
                            <div className="relative w-full h-[85%] rounded-xl overflow-hidden mb-4 group/fire">
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover/fire:scale-110"
                                />
                                <div className="absolute inset-0 opacity-0 group-hover/fire:opacity-100 transition-opacity duration-300">
                                    <FireEffect />
                                </div>
                            </div>

                            <div className="p-1">
                                <h4 className="text-xs md:text-sm font-syne font-bold mb-1">{card.title}</h4>
                                <div className="flex justify-between items-end text-[10px] md:text-xs">
                                    <div>
                                        <p className="text-white/40">Price:</p>
                                        <p className="text-white/40">{card.timeLeft}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-neon-blue">{card.price}</p>
                                        <p className="text-white/40">{card.likes} Likes</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
