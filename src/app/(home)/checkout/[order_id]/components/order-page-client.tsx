"use client";
import Link from "next/link";
import CheckoutOrderHeader from "./checkout-order-header";
import OrderItemsCard from "./order-items-card";
import OrderLoadingState from "./order-loading-state";
import OrderNotFoundState from "./order-not-found-state";
import OrderPageShell from "./order-page-shell";
import OrderSummaryCard from "./order-summary-card";
import { useOrderDetailData } from "../hooks/use-order-detail-data";

export default function OrderPageClient({ orderId }: { orderId: string }) {
    const { isHydrated, isResolvingOrder, order, dbOrder } = useOrderDetailData(orderId);

    if (!isHydrated || isResolvingOrder) {
        return (
            <OrderPageShell>
                <OrderLoadingState message="Loading order..." />
            </OrderPageShell>
        );
    }

    if (!order) {
        return <OrderNotFoundState message="Order not found in local storage or server data." />;
    }

    return (
        <OrderPageShell>
            <main className="max-w-4xl mx-auto px-6 pt-12 space-y-6">
                <CheckoutOrderHeader
                    eyebrow="Order Detail"
                    title={order.order_id}
                    backHref="/checkout/"
                    backLabel="Back"
                    titleClassName="text-2xl md:text-3xl font-mono font-bold"
                />

                <OrderSummaryCard order={order} dbOrder={dbOrder} />
                <OrderItemsCard order={order} />

                <div>
                    <Link
                        href={`/checkout/payment/${encodeURIComponent(order.order_id)}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700"
                    >
                        Open Payment CheckOut Details
                    </Link>
                </div>
            </main>
        </OrderPageShell>
    );
}
