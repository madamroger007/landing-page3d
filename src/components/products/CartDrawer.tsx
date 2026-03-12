"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  X,
  Trash2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useCartContext } from "../../store/context/cart/CartContext";
import { getYouTubeEmbedUrl } from "../../utils/utils";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    cart,
    cartTotal,
    cartCount,
    removeFromCart,
    addToCart,
    clearCart,
  } = useCartContext();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,10,30,0.98) 0%, rgba(5,5,20,0.98) 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-neon-blue" />
                <h2 className="font-syne font-bold text-lg">
                  Cart{" "}
                  <span className="text-white/30 text-sm font-normal">
                    ({cartCount})
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-48 gap-4"
                  >
                    <ShoppingBag className="w-12 h-12 text-white/10" />
                    <p className="text-white/30 text-sm">Your cart is empty</p>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 p-4 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        {item.videoUrl ? (
                          <div className="relative w-full h-full">
                            <iframe
                              src={getYouTubeEmbedUrl(item.videoUrl) || ""}
                              className="absolute inset-0 w-full h-full border-0"
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <Image
                            src={item.image || "/nft-card-1.png"}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover/fire:scale-110"
                          />
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex-1 min-w-0">
                        <p className="font-syne font-bold text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {item.price}
                        </p>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-neon-blue/20 flex items-center justify-center text-xs font-bold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-neon-blue/20 flex items-center justify-center text-xs font-bold transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="self-start w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/40" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm">Total</span>
                  <span className="font-syne font-bold text-lg text-neon-blue">
                    {(cartTotal / 1_000_000).toFixed(1)} ETH
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-4 rounded-xl font-syne font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 mb-2"
                  style={{
                    background:
                      "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                  Checkout Products
                </Link>


                <button
                  onClick={clearCart}
                  className="w-full py-2 text-white/20 hover:text-white/50 text-xs transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
