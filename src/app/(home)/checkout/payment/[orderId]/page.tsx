"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import CustomCursor from "@/src/components/CustomCursor";
import { Orders } from "@/src/types/type";
import { formatMoneyFromIdr, resolveUserLocaleCurrency } from "@/src/utils/utils";
import { fetchPublicOrderById, readPendingOrderById, upsertPendingOrder } from "../../[order_id]/utils";
import PaymentInstructionsPanel from "./components/payment-instructions-panel";
import PaymentLoadingState from "./components/payment-loading-state";
import { getMethodDetails } from "./components/payment-method-details";
import PaymentOrderActions from "./components/payment-order-actions";
import PaymentNotFoundState from "./components/payment-not-found-state";
import PaymentTopInfo from "./components/payment-top-info";
import { buildPaymentDisplayData, extractPaymentMetaFromStatus, normalizeStatus } from "./components/payment-utils";
import { SendEmailConfirmation } from "@/src/server/actions/email/action";

export default function PaymentStatusPage() {
  const { orderId } = useParams();
  const orderIdParam = typeof orderId === "string" ? orderId : "";
  const [order, setOrder] = useState<Orders | null>(null);
  const [isResolvingOrder, setIsResolvingOrder] = useState(true);
  const [notFoundMessage, setNotFoundMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [{ locale, currency }] = useState(() => resolveUserLocaleCurrency());

  useEffect(() => {
    let isActive = true;

    const resolveOrder = async () => {
      if (!orderIdParam) {
        if (!isActive) return;
        setOrder(null);
        setNotFoundMessage("Invalid order ID.");
        setIsResolvingOrder(false);
        return;
      }

      const localOrder = readPendingOrderById(orderIdParam);
      if (localOrder) {
        if (!isActive) return;
        setOrder(localOrder);
        setNotFoundMessage("");
        setIsResolvingOrder(false);
        return;
      }

      const serverOrder = await fetchPublicOrderById(orderIdParam);

      if (!isActive) return;

      if (serverOrder) {
        upsertPendingOrder(serverOrder);
        setOrder(serverOrder);
        setNotFoundMessage("");
      } else {
        setOrder(null);
        setNotFoundMessage("Order not found in local storage or server data.");
      }

      setIsResolvingOrder(false);
    };

    void resolveOrder();

    return () => {
      isActive = false;
    };
  }, [orderIdParam]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckPaymentStatus = async () => {
    if (!order?.order_id) return;

    setCheckingStatus(true);
    setStatusMessage("");

    try {
      const response = await fetch(
        `/api/payment/transaction-status?order_id=${encodeURIComponent(order.order_id)}`
      );
      const data = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        throw new Error((data.error as string) || "Failed to fetch payment status");
      }

      // send email to user about the status success or failed
      if (data.transaction_status === "settlement") {
        await SendEmailConfirmation({
          email: order.customer.email,
          name: order.customer.name,
          order_id: order.order_id,
          items: JSON.stringify(order.items),
          total: order.gross_amount,
        });

      }

      const nextStatus = normalizeStatus((data.transaction_status as string) || "pending");
      const nextMeta = extractPaymentMetaFromStatus(data, {
        preferredPaymentName: order.payment_name,
      });

      const nextMetaDefined = Object.fromEntries(
        Object.entries(nextMeta).filter(([, value]) => value !== undefined)
      ) as Partial<Orders>;

      const rawSnapCandidate = nextMetaDefined.raw_snap_result as Record<string, unknown> | undefined;
      const hasActionPayload = Array.isArray(rawSnapCandidate?.actions) && rawSnapCandidate.actions.length > 0;
      const shouldUpdateRawSnap =
        hasActionPayload ||
        Boolean(nextMetaDefined.qris_url) ||
        Boolean(nextMetaDefined.deeplink_url) ||
        (Array.isArray(nextMetaDefined.va_numbers) && nextMetaDefined.va_numbers.length > 0);

      const mergedOrder: Orders = {
        ...order,
        status: nextStatus,
        ...nextMetaDefined,
        raw_snap_result: shouldUpdateRawSnap
          ? nextMetaDefined.raw_snap_result
          : order.raw_snap_result,
      };

      upsertPendingOrder(mergedOrder);

      setOrder(mergedOrder);
      setStatusMessage(`Latest status: ${String(data.transaction_status || "pending")}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to check payment status");
    } finally {
      setCheckingStatus(false);
    }
  };

  if (isResolvingOrder) {
    return <PaymentLoadingState />;
  }

  if (!order) {
    return <PaymentNotFoundState message={notFoundMessage} />;
  }

  const isSuccess = order.status === "success";
  const methodDetails = getMethodDetails(order.payment_method);
  const displayData = buildPaymentDisplayData(order);

  return (
    <div className="min-h-screen text-white pb-20 bg-dark-bg">
      <CustomCursor />

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <Link
          href="/products"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.01)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          }}
        >
          <PaymentTopInfo order={order} isSuccess={isSuccess} methodDetails={methodDetails} />

          <div className="p-8 md:p-12 text-center bg-white/1">
            <div className="mb-8">
              <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold mb-3">Order Total</p>
              <h1 className="text-5xl md:text-6xl font-syne font-bold text-transparent bg-clip-text bg-linear-to-r from-neon-blue to-purple-400">
                {formatMoneyFromIdr(order.gross_amount, { locale, currency })}
              </h1>
            </div>

            <div className="max-w-xs mx-auto space-y-4">
              <PaymentInstructionsPanel
                isSuccess={isSuccess}
                instructions={methodDetails.instructions}
                displayData={displayData}
                store={order.store}
                copied={copied}
                onCopy={copyToClipboard}
              />

              <PaymentOrderActions
                orderId={order.order_id}
                isSuccess={isSuccess}
                checkingStatus={checkingStatus}
                onCheckStatus={handleCheckPaymentStatus}
                statusMessage={statusMessage}
              />
            </div>
          </div>
        </motion.div>

        <div className="mt-8 flex justify-between px-4 text-[10px] uppercase tracking-widest text-white/20 font-black">
          <div>Trx Date: {new Date(order.createdAt).toLocaleDateString()}</div>
          <div className="inline-flex items-center gap-2">
            <ShoppingBag className="w-3 h-3" />
            Secured by Midtrans
          </div>
        </div>
      </div>
    </div>
  );
}
