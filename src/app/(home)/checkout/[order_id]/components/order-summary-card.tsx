import { ExternalLink } from "lucide-react";
import { Orders } from "@/src/types/type";
import { formatIDR } from "@/src/utils/utils";
import { DbOrderInfo } from "../types";
import { getDisplayLabel } from "../utils";
import OrderStatusBadge from "./order-status-badge";

type OrderSummaryCardProps = {
    order: Orders;
    dbOrder: DbOrderInfo | null;
};

export default function OrderSummaryCard({ order, dbOrder }: OrderSummaryCardProps) {
    const label = getDisplayLabel(order.status, dbOrder?.orderLabel);

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge label={label} />
                <span className="text-white/50 text-xs">
                    Status: {(dbOrder?.transactionStatus || order.status || "pending").toUpperCase()}
                </span>
            </div>

            <p className="text-white/80 text-sm">
                Customer: <strong>{order.customer?.name || "-"}</strong> ({order.customer?.email || "-"})
            </p>

            <p className="text-white/80 text-sm">
                Total: <strong>{formatIDR(order.gross_amount)}</strong>
            </p>

            <div className="text-sm text-white/80">
                <p className="font-semibold mb-1">Link to your product order</p>
                {dbOrder?.productLink ? (
                    <a
                        href={dbOrder.productLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-300 hover:underline break-all"
                    >
                        {dbOrder.productLink}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                ) : (
                    <span className="text-white/50">Not set yet</span>
                )}
            </div>
        </div>
    );
}