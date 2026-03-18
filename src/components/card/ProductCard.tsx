"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { useCartContext } from "../../store/context/cart/CartContext";
import { Product } from "@/src/types/type";
import { getYouTubeEmbedUrl } from "../../utils/utils";

type ProductCardProps = {
  product: Product;
  index: number;
};

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart, cart } = useCartContext();
  const [liked, setLiked] = useState(false);
  const inCart = cart.some((c) => c.id === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      layout
      className="group rounded-[32px] p-4 flex flex-col hover:bg-white/4 transition-all duration-500"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Media */}
      <div className="relative aspect-4/3 rounded-[22px] overflow-hidden mb-5">
        {product.videoUrl ? (
          <div className="relative w-full h-full">
            <iframe
              src={getYouTubeEmbedUrl(product.videoUrl) || ""}
              className="absolute inset-0 w-full h-full border-0 pointer-events-none"
              allow="autoplay; encrypted-media"
              loading="lazy"
            />
            {/* Overlay to catch clicks and prevent iframe interaction while in grid */}
            <div className="absolute inset-0 z-10" />
          </div>
        ) : (
          <Image
            src={product.image ?? "/nft-card-1.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Like button */}
        <button
          onClick={() => setLiked((l) => !l)}
          aria-label="Toggle like"
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all backdrop-blur-xl"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${liked ? "text-pink-500 fill-pink-500" : "text-white/40"
              }`}
          />
          <span className="text-white/60">
            {(product.likes ?? 0) + (liked ? 1 : 0)}
          </span>
        </button>

        {/* Category badge */}
        <div
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl"
          style={{
            background: "rgba(0,210,255,0.12)",
            border: "1px solid rgba(0,210,255,0.2)",
            color: "#00d2ff",
          }}
        >
          {product.category}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col px-1">
        <h3 className="font-syne font-bold text-base mb-1 group-hover:text-neon-blue transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-white/30 text-xs leading-relaxed line-clamp-2 mb-4">
          {product.description}
        </p>
        <div>
          {product.tools && product.tools.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {product.tools.slice(0, 3).map((tool) => (
                <span
                  key={tool.id}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-white/60"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-widest mb-0.5">
              Price
            </p>
            <p className="font-syne font-bold text-sm text-white">
              {product.price}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/products/${product.id}`}
              className="px-3 py-2.5 rounded-xl text-xs font-bold text-white/80 hover:text-white transition-colors border border-white/15 hover:border-white/30"
              aria-label={`View details for ${product.name}`}
            >
              Detail
            </Link>

            <button
              onClick={() => addToCart(product)}
              aria-label={inCart ? "Already in cart" : "Add to cart"}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${inCart
                ? "text-neon-blue"
                : "hover:shadow-[0_0_20px_rgba(0,210,255,0.3)]"
                }`}
              style={
                inCart
                  ? {
                    background: "rgba(0,210,255,0.1)",
                    border: "1px solid rgba(0,210,255,0.3)",
                  }
                  : {
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }
              }
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
