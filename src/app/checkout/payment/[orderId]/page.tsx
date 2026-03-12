"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomCursor from "../../../../components/CustomCursor";
import { useCartContext } from "@/src/store/context/cart/CartContext";
import { Orders } from "@/src/types/type";

export default function PaymentStatusPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { clearCart } = useCartContext();
  const [order, setOrder] = useState<Orders | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    // Load order from localStorage
    const savedOrders = JSON.parse(localStorage.getItem("pending_orders") || "{}");
    const foundOrder = savedOrders[orderId as string];

    if (foundOrder) {
      Promise.resolve().then(() => setOrder(foundOrder));
    } else {
      // If not found, maybe redirect to products
      setTimeout(() => router.push("/products"), 3000);
    }
  }, [orderId, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayNow = () => {
    if (!order?.snap_token) return;

    window.snap?.pay(order.snap_token, {
      onSuccess: async (result: any) => {
        // Update local status
        const savedOrders = JSON.parse(localStorage.getItem("pending_orders") || "{}");
        if (savedOrders[order.order_id]) {
          savedOrders[order.order_id].status = "success";
          localStorage.setItem("pending_orders", JSON.stringify(savedOrders));
        }
        setOrder((prev: any) => ({ ...prev, status: "success" }));

        // Send email
        try {
          await fetch("/api/email/send-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: order.customer?.email,
              name: order.customer?.name,
              phone: order.customer?.phone,
              order_id: order.order_id,
              items: order.items,
              total: order.gross_amount,
            }),
          });
        } catch (e) {
          console.error("Email failed", e);
        }

        clearCart();
      },
      onPending: (result: any) => {
        console.log("Pending", result);
      },
      onError: (result: any) => {
        console.error("Error", result);
      },
      onClose: () => {
        console.log("Closed");
      }
    });
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Clock className="w-12 h-12 text-neon-blue animate-spin" />
        <p className="font-syne text-xl">Loading order details...</p>
      </div>
    );
  }

  const isSuccess = order.status === "success";

  const getMethodDetails = () => {
    switch (order.payment_method) {
      case "qris":
        return {
          label: "QRIS / QR Code",
          icon: <QrCode className="w-6 h-6 text-neon-blue" />,
          instructions: "Scan the QR code below using your favorite payment app (OVO, GoPay, Dana, etc.)"
        };
      case "va":
        return {
          label: "Bank Transfer (VA)",
          icon: <CreditCard className="w-6 h-6 text-neon-blue" />,
          instructions: "Transfer the exact amount to the Virtual Account number displayed below."
        };
      case "wallet":
        return {
          label: "E-Wallet",
          icon: <ShoppingBag className="w-6 h-6 text-neon-blue" />,
          instructions: "Follow the prompts in your chosen E-Wallet app to complete the transaction."
        };
      default:
        return {
          label: "Standard Payment",
          icon: <CreditCard className="w-6 h-6 text-neon-blue" />,
          instructions: "Proceed to secure payment platform to choose your preferred method."
        };
    }
  };

  const methodDetails = getMethodDetails();

  return (
    <div className="min-h-screen text-white pb-20 bg-dark-bg">
      <CustomCursor />

      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <Link href="/products" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* ── Main Card (Lynk Style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.01)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5)"
          }}
        >
          {/* Top Info Section */}
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-neon-blue" />
                </div>
                <div>
                  <h2 className="font-syne font-bold text-xl uppercase tracking-tighter">MadamSpace</h2>
                  <p className="text-xs text-white/30">Official Merchant</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isSuccess ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-orange-500/20 text-orange-400 border border-orange-500/30"}`}>
                {order.status}
              </div>
            </div>

            <div className="space-y-4">

              <div className="flex justify-between text-sm">
                <span className="text-white/40">Your name :</span>
                <span className="text-white/80 font-medium">{order.customer?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Your email :</span>
                <span className="text-white/80 font-medium">{order.customer?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Your Phone :</span>
                <span className="text-white/80 font-medium">{order.customer?.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Products :</span>
                <span className="text-white/80 font-medium">
                  {order.items.length}x {order.items[0]?.name}{order.items.length > 1 ? ` & ${order.items.length - 1} more` : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Method :</span>
                <span className="text-neon-blue font-bold flex items-center gap-2">
                  {methodDetails.label}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/2 border border-white/5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs text-white/50 leading-relaxed">
                Make sure the merchant name, amount, and details are correct before proceeding with the payment.
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-8 md:p-12 text-center bg-white/1">
            <div className="mb-8">
              <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold mb-3">Order Total</p>
              <h1 className="text-5xl md:text-6xl font-syne font-bold text-transparent bg-clip-text bg-linear-to-r from-neon-blue to-purple-400">
                {order.gross_amount}
                <span className="text-xl ml-2 text-white/40 font-normal tracking-normal">USD</span>
              </h1>
            </div>

            <div className="max-w-xs mx-auto space-y-4">
              {/* Method Specific UI */}
              <AnimatePresence mode="wait">
                {!isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6"
                  >
                    <p className="text-[10px] text-white/40 uppercase font-black mb-4">Payment Instructions</p>
                    <p className="text-xs text-white/60 mb-6">{methodDetails.instructions}</p>

                    {order.payment_method === "qris" && (
                      <div className="aspect-square w-48 mx-auto bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <QrCode className="w-full h-full text-black" />
                      </div>
                    )}

                    {order.payment_method === "va" && (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-neon-blue">
                        8806 0812 3456 7890
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-[10px] text-left text-white/30 uppercase font-black mb-1">Invoice Number</p>
                  <p className="text-xs font-mono text-white/60">{order.order_id}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(order.order_id)}
                  className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/30" />}
                </button>
              </div>

              {!isSuccess ? (
                <button
                  onClick={handlePayNow}
                  className="w-full py-5 rounded-2xl font-syne font-bold text-base tracking-wide transition-all duration-500 flex items-center justify-center gap-3 relative group overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #00d2ff 0%, #6c47ff 100%)",
                    boxShadow: "0 20px 50px rgba(0,210,255,0.4)"
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              ) : (
                <div className="py-5 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-syne font-bold text-green-400">Payment Complete</h3>
                  <p className="text-sm text-white/40">Check your email for confirmation!</p>
                  <Link href="/products" className="mt-4 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">
                    Back to Marketplace
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Additional Meta ── */}
        <div className="mt-8 flex justify-between px-4 text-[10px] uppercase tracking-widest text-white/20 font-black">
          <div>Trx Date: {new Date(order.createdAt).toLocaleDateString()}</div>
          <div>Secured by Midtrans</div>
        </div>
      </div>
    </div>
  );
}
