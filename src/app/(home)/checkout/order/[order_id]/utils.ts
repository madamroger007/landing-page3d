import { Orders } from "@/src/types/type";
import { DbOrderInfo, OrderLabel } from "./types";

export function normalizeOrderLabel(status?: string | null): OrderLabel {
    const raw = (status || "pending").toLowerCase();

    if (["progress", "revisi", "done", "pending", "cancelled"].includes(raw)) {
        return raw as OrderLabel;
    }

    if (raw === "success" || raw === "settlement") return "done";
    if (raw === "cancel" || raw === "expire" || raw === "failure") return "cancelled";

    return "pending";
}

export function getDisplayLabel(orderStatus?: string | null, dbLabel?: string | null): OrderLabel {
    return normalizeOrderLabel(dbLabel || orderStatus || "pending");
}

export function labelClassName(label: OrderLabel): string {
    switch (label) {
        case "progress":
            return "bg-yellow-100 text-yellow-800";
        case "revisi":
            return "bg-orange-100 text-orange-800";
        case "done":
            return "bg-green-100 text-green-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-200 text-gray-700";
    }
}

function parsePendingOrdersRecord(): Record<string, Orders> {
    try {
        const raw = localStorage.getItem("pending_orders") || "{}";
        const parsed = JSON.parse(raw) as unknown;

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }

        return parsed as Record<string, Orders>;
    } catch {
        return {};
    }
}

export function readPendingOrders(): Orders[] {
    const pending = parsePendingOrdersRecord();
    const allOrders = Object.values(pending);

    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allOrders;
}

export function readPendingOrderById(orderId: string): Orders | null {
    const pending = parsePendingOrdersRecord();
    return pending[orderId] || null;
}

export async function fetchDbOrdersByIds(orderIds: string[]): Promise<Record<string, DbOrderInfo>> {
    if (orderIds.length === 0) return {};

    try {
        const response = await fetch("/api/payment/orders/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_ids: orderIds }),
        });

        if (!response.ok) return {};

        const data = (await response.json()) as { orders?: DbOrderInfo[] };
        const map: Record<string, DbOrderInfo> = {};

        for (const order of data.orders || []) {
            map[order.orderId] = order;
        }

        return map;
    } catch {
        return {};
    }
}

export async function fetchDbOrderById(orderId: string): Promise<DbOrderInfo | null> {
    const map = await fetchDbOrdersByIds([orderId]);
    return map[orderId] || null;
}