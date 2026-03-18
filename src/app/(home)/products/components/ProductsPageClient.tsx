"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ChevronDown,
  X,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useProductContext } from "../../../../store/context/product/ProductContext";
import { useCartContext } from "@/src/store/context/cart/CartContext";
import CartDrawer from "./CartDrawer";
import ProductCard from "../../../../components/card/ProductCard";
import { SORT_OPTIONS, SortKey, sortProducts } from "../../../../types/type";
import CustomCursor from "../../../../components/CustomCursor";
import BackgroundLayout from "../../../../components/BackgroundLayout";

export default function ProductsPageClient() {
  const { products, categories } = useProductContext();
  const { cartCount } = useCartContext();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? "";

  const filtered = useMemo(() => {
    let list = products;

    if (activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    return sortProducts(list, sortKey);
  }, [products, search, activeCategory, sortKey]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setActiveCategory("All");
  }, []);

  return (
    <section>
      <CustomCursor />
      <BackgroundLayout />
      <div
        className="min-h-screen text-white"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(84,119,146,0.12) 0%, rgba(0,0,128,0.25) 50%, #000 80%)",
        }}
      >
        <div
          className="fixed w-full z-30 backdrop-blur-2xl"
          style={{
            background: "rgba(5,5,20,0.85)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                id="product-search"
                type="text"
                placeholder="Search products, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder-white/20 outline-none focus:border-neon-blue/40 focus:bg-white/[0.07] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative shrink-0">
              <button
                id="sort-trigger"
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <ArrowUpDown className="w-4 h-4 text-white/40" />
                <span className="text-white/70 hidden sm:inline">{activeSortLabel}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/30 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50 py-1"
                    style={{
                      background: "rgba(10,10,30,0.98)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortKey(opt.value);
                          setSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                      >
                        <span className={sortKey === opt.value ? "text-neon-blue" : "text-white/60"}>
                          {opt.label}
                        </span>
                        {sortKey === opt.value && <Check className="w-3.5 h-3.5 text-neon-blue" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              id="open-cart"
              onClick={() => setCartOpen(true)}
              className="hidden relative md:flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(108,71,255,0.15) 100%)",
                border: "1px solid rgba(0,210,255,0.2)",
              }}
            >
              <ShoppingCart className="w-4 h-4 text-neon-blue" />
              <span className="hidden sm:inline text-white/80">Cart</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{
                    background: "linear-gradient(135deg, #00d2ff, #6c47ff)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-30">
          <div className="fixed bottom-6 right-6 z-50">
            <button
              id="open-cart"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(108,71,255,0.15) 100%)",
                border: "1px solid rgba(0,210,255,0.2)",
              }}
            >
              <ShoppingCart className="w-4 h-4 text-neon-blue" />
              <span className="hidden sm:inline text-white/80">Cart</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{
                    background: "linear-gradient(135deg, #00d2ff, #6c47ff)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-neon-blue mb-4">
              <Sparkles className="w-3 h-3" />
              Digital Service Catalog
            </div>
            <h1 className="text-4xl md:text-6xl font-syne font-bold mb-4">
              All
              <span
                style={{
                  background: "linear-gradient(135deg, #00d2ff, #6c47ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {" "}
                Products
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-sm md:text-base text-white/70 leading-relaxed">
              Explore digital services for website design, video editing, image editing,
              and creative visual assets to make your brand stand out.
            </p>
            <div className="w-24 h-1 bg-linear-to-r from-neon-blue to-neon-purple mx-auto rounded-full mt-6" />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeCategory === cat.name
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <SlidersHorizontal className="w-4 h-4" />
              <span>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {activeCategory !== "All" && <span className="text-neon-blue/70"> . {activeCategory}</span>}
                {search && <span className="text-white/40"> for &quot;{search}&quot;</span>}
              </span>
            </div>

            {(search || activeCategory !== "All") && (
              <button
                onClick={clearFilters}
                className="text-xs text-white/30 hover:text-white transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-4"
              >
                <Search className="w-16 h-16 text-white/10" />
                <p className="text-white/30 text-lg font-syne">No products found</p>
                <p className="text-white/15 text-sm">Try adjusting your search or filters</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </section>
  );
}
