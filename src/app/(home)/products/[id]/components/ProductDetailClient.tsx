"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/src/types/type";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import CustomCursor from "@/src/components/CustomCursor";
import BackgroundLayout from "@/src/components/BackgroundLayout";
import { useCartContext } from "@/src/store/context/cart/CartContext";
import { formatIDR, getYouTubeEmbedUrl } from "@/src/utils/utils";
import { getProducts } from "@/src/server/actions/products/action";

type ProductDetailClientProps = {
    productId: number;
};

type MediaItem = {
    type: "image" | "video";
    src: string;
    label: string;
};

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
    const { addToCart, cart, cartCount } = useCartContext();
    const inCart = cart.some((item) => item.id === productId);

    // check if product exists from local storage get in, if not get product from local storage get from server
    const [product, setProduct] = useState<Product>({} as Product);

    useEffect(() => {
        const storedProducts = localStorage.getItem("products");
        const products = storedProducts ? JSON.parse(storedProducts) : [];
        const foundProduct = products.find((item: Product) => item.id === productId);

        if (foundProduct) {
            Promise.resolve().then(() => setProduct(foundProduct));
        } else {
            // fallback to fetch from server if not found in local storage
            getProducts().then((data) => {
                const foundProduct = data.products.find((item: Product) => item.id === productId);
                if (foundProduct) {
                    setProduct(foundProduct);
                    localStorage.setItem("products", JSON.stringify(data.products));
                }
            });
        }
    }, [productId]);

    const mediaItems = useMemo<MediaItem[]>(() => {
        const items: MediaItem[] = [];

        if (product.image) {
            items.push({ type: "image", src: product.image, label: "Image" });
        }

        if (product.videoUrl) {
            const embedUrl = getYouTubeEmbedUrl(product.videoUrl);
            if (embedUrl) {
                items.push({ type: "video", src: embedUrl, label: "Video" });
            }
        }

        if (items.length === 0) {
            items.push({ type: "image", src: "/nft-card-1.png", label: "Preview" });
        }

        return items;
    }, [product.image, product.videoUrl]);

    const [activeMedia, setActiveMedia] = useState(0);
    const currentMedia = mediaItems[activeMedia];

    const showNext = () => {
        setActiveMedia((prev) => (prev + 1) % mediaItems.length);
    };

    const showPrev = () => {
        setActiveMedia((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    };

    return (
        <section className="relative min-h-screen text-white">
            <CustomCursor />
            <BackgroundLayout />
            <Navbar />

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:text-white transition-colors border border-white/10 hover:border-white/30 bg-white/5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to products
                    </Link>

                    <Link
                        href="/checkout"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,210,255,0.16), rgba(108,71,255,0.16))",
                            border: "1px solid rgba(0,210,255,0.28)",
                        }}
                    >
                        <ShoppingCart className="w-4 h-4 text-neon-blue" />
                        Checkout
                        {cartCount > 0 ? <span className="text-neon-blue">({cartCount})</span> : null}
                    </Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <section
                        className="rounded-[30px] p-4 md:p-5"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <div className="relative aspect-video overflow-hidden rounded-[22px] bg-black/40">
                            {currentMedia.type === "video" ? (
                                <iframe
                                    src={currentMedia.src}
                                    className="absolute inset-0 w-full h-full border-0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    loading="lazy"
                                    title={`${product.name} video preview`}
                                />
                            ) : (
                                <Image
                                    src={currentMedia.src}
                                    alt={product.name || "Product Image"}
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            )}

                            {mediaItems.length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={showPrev}
                                        aria-label="Previous media"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/55 border border-white/20 hover:bg-black/75 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={showNext}
                                        aria-label="Next media"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/55 border border-white/20 hover:bg-black/75 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {mediaItems.map((item, index) => (
                                <button
                                    key={`${item.type}-${index}`}
                                    type="button"
                                    onClick={() => setActiveMedia(index)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeMedia === index
                                        ? "text-white"
                                        : "text-white/50 hover:text-white/80"
                                        }`}
                                    style={
                                        activeMedia === index
                                            ? {
                                                background: "linear-gradient(135deg, rgba(0,210,255,0.2), rgba(108,71,255,0.2))",
                                                border: "1px solid rgba(0,210,255,0.28)",
                                            }
                                            : {
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                            }
                                    }
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section
                        className="rounded-[30px] p-6 md:p-8"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <p className="text-xs uppercase tracking-[0.3em] text-neon-blue">
                            {product.category ?? "Uncategorized"}
                        </p>
                        <h1 className="mt-3 text-3xl md:text-5xl font-syne font-bold leading-tight">{product.name}</h1>
                        <p className="mt-5 text-white/75 leading-relaxed">{product.description}</p>

                        {product.tools && product.tools.length > 0 ? (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {product.tools.map((tool) => (
                                    <span
                                        key={tool.id}
                                        className="px-3 py-1 rounded-full text-xs font-semibold text-neon-blue bg-neon-blue/10 border border-neon-blue/30"
                                    >
                                        {tool.name}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        <div className="mt-8 space-y-2">
                            <div className="rounded-2xl px-4 py-3 bg-white/4 border border-white/8">
                                <p className="text-[11px] uppercase tracking-widest text-white/40">Price</p>
                                <p className="mt-1 text-lg md:text-2xl font-bold text-white">{formatIDR(product.price)}</p>
                            </div>
                            <div className="px-4 py-3">
                                <p className="text-[10px] uppercase tracking-widest text-white/40">Total Likes</p>
                                <p className="mt-1 text-lg md:text-2xl font-bold text-white inline-flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-neon-pink fill-neon-pink" />
                                    {product.likes ?? 0}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => addToCart(product)}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${inCart ? "text-neon-blue" : "text-white"
                                    }`}
                                style={
                                    inCart
                                        ? {
                                            background: "rgba(0,210,255,0.1)",
                                            border: "1px solid rgba(0,210,255,0.35)",
                                        }
                                        : {
                                            background: "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                        }
                                }
                            >
                                <ShoppingCart className="w-4 h-4" />
                                {inCart ? "Added to Cart" : "Add to Cart"}
                            </button>

                        </div>
                    </section>
                </div>
            </main>

            <div className="relative z-10">
                <Footer />
            </div>
        </section>
    );
}
