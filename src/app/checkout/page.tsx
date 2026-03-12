"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Check,
  Loader2,
  ShoppingCart,
  Play,
} from "lucide-react";
import { useCartContext } from "../../store/context/cart/CartContext";
import CustomCursor from "../../components/CustomCursor";
import { getYouTubeEmbedUrl } from "../../utils/utils";
import ModalVoucher from "../../components/ModalVoucher";
import { sendLinkEmailPayment } from "@/src/server/actions/payment/action";

const fee: number = parseFloat(process.env.NEXT_PUBLIC_FEE || "0");
export default function CheckoutPage() {
  const {
    cart,
    cartTotal,
    cartCount,
    removeFromCart,
    addToCart,
    checkout,
    checkoutStatus,
  } = useCartContext();

  const [customerInfo, setCustomerInfo] = React.useState({
    name: "",
    email: "",
    phone: ""
  });

  const [open, setOpen] = React.useState(false);

  const openModal = () => {
    setOpen(true);
  }
  const closeModal = () => {
    setOpen(false);
  }

  const handleSubmitVoucher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const voucher = e.currentTarget.voucher.value;
    console.log(voucher);

    closeModal();
  }

  const isFormValid =
    customerInfo.name.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!isFormValid) return;

    const payload = {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone
    };
    const result = await checkout(payload);

    if (result) {
      window.location.href = `/checkout/payment/${result.order_id}`;

    }
  };


  return (
    <div
      className="min-h-screen text-white pb-20"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(84,119,146,0.12) 0%, rgba(0,0,128,0.25) 50%, #000 100%)",
      }}
    >
      <CustomCursor />

      {/* ── Top Bar ── */}
      <div
        className="sticky top-0 z-30 backdrop-blur-2xl"
        style={{
          background: "rgba(5,5,20,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <h1 className="font-syne font-bold text-lg hidden md:block">
            Review Your Order
          </h1>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <ShoppingBag className="w-4 h-4 text-neon-blue" />
            <span className="text-sm font-bold">{cartCount} Items</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-12 md:pt-20">
        <div className="grid md:grid-cols-2 grid-cols-1 lg:grid-cols-3 gap-12">
          {/* ── Items List ── */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl md:text-4xl font-syne font-bold mb-8">
              Order Details
            </h2>

            {/* ── Customer Info Form ── */}
            <div className="glass-card rounded-[32px] p-8 mb-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h3 className="text-xl font-syne font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue text-sm">1</span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-blue/50 transition-all text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-blue/50 transition-all text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs uppercase tracking-widest text-white/40 ml-1">Number Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="number"
                    placeholder="Enter your number phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-blue/50 transition-all text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-syne font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue text-sm">2</span>
              Review Items
            </h3>

            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center"
                >
                  <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 mb-6">Your cart is empty</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm transition-transform hover:scale-105"
                  >
                    Go to Products
                  </Link>
                </motion.div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row gap-8 group"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Media Preview */}
                    <div className="relative w-full md:w-64 aspect-square rounded-2xl overflow-hidden shrink-0">
                      {item.videoUrl ? (
                        <div className="relative w-full h-full">
                          <iframe
                            src={getYouTubeEmbedUrl(item.videoUrl) || ""}
                            className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-150"
                            allow="autoplay; encrypted-media"
                          />
                          <div className="absolute inset-0 bg-transparent" />
                        </div>
                      ) : (
                        <Image
                          src={item.image ?? "/nft-card-1.png"}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl bg-black/40 border border-white/10">
                        {item.category}
                      </div>

                      {item.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Play className="w-10 h-10 text-white fill-white shadow-2xl" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl md:text-2xl font-syne font-bold group-hover:text-neon-blue transition-colors">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-white/40 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-blue/20 flex items-center justify-center font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="font-syne font-bold text-lg min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-neon-blue/20 flex items-center justify-center font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-white/20 text-[10px] uppercase tracking-widest mb-1">
                            Line Total
                          </p>
                          <p className="font-syne font-bold text-xl text-neon-blue">
                            {((item.price * item.quantity))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* ── Summary Card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div
                className="glass-card rounded-[32px] p-8"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3 className="font-syne font-bold text-xl mb-8">Summary</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white/70">{(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Percentage Fee</span>
                    <span className="text-white/70">{fee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Total Fee</span>
                    <span className="text-white/70">{cartTotal * fee}</span>
                  </div>
                  <div className="w-full h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-bold">Total Price</span>
                    <span className="text-2xl font-syne font-bold text-neon-blue">
                      {(cartTotal + cartTotal * fee)}
                    </span>
                  </div>
                </div>

                <ModalVoucher open={open} openModal={openModal} closeModal={closeModal} handleSubmitVoucher={handleSubmitVoucher} />

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || checkoutStatus === "loading" || !isFormValid}
                  className="w-full py-5 rounded-2xl font-syne font-bold text-base tracking-wide transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                  style={{
                    background:
                      "linear-gradient(135deg, #00d2ff 0%, #6c47ff 100%)",
                    boxShadow: isFormValid ? "0 0 40px rgba(0,210,255,0.3)" : "none",
                  }}
                >
                  {checkoutStatus === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : checkoutStatus === "success" ? (
                    <>
                      <Check className="w-5 h-5" />
                      Paid Successfully!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      {!customerInfo.name || !customerInfo.email ? "Check your input" : "Complete Payment"}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-white/20 text-center mt-6 uppercase tracking-wider leading-relaxed px-4">
                  Secure checkout powered by Midtrans Payment Gateway. Standard blockchain fees apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
