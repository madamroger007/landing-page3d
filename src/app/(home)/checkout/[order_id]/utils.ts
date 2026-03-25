import { Orders } from "@/src/types/type";
import { DbOrderInfo, OrderLabel } from "./types";

const PENDING_ORDERS_STORAGE_KEY = "pending_orders";

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
        const raw = localStorage.getItem(PENDING_ORDERS_STORAGE_KEY) || "{}";
        const parsed = JSON.parse(raw) as unknown;

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return {};
        }

        return parsed as Record<string, Orders>;
    } catch {
        return {};
    }
}

export function upsertPendingOrder(order: Orders): void {
    const pending = parsePendingOrdersRecord();
    pending[order.order_id] = order;
    localStorage.setItem(PENDING_ORDERS_STORAGE_KEY, JSON.stringify(pending));
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

function normalizePublicOrder(payload: unknown): Orders | null {
    if (!payload || typeof payload !== "object") return null;

    const source = payload as Partial<Orders>;
    const orderId = typeof source.order_id === "string" ? source.order_id : "";

    if (!orderId) return null;

    return {
        createdAt: typeof source.createdAt === "string" ? source.createdAt : new Date().toISOString(),
        items: Array.isArray(source.items) ? source.items : [],
        order_id: orderId,
        status: typeof source.status === "string" ? source.status : "pending",
        product_link: typeof source.product_link === "string" ? source.product_link : undefined,
        gross_amount:
            typeof source.gross_amount === "number" && Number.isFinite(source.gross_amount)
                ? source.gross_amount
                : 0,
        snap_token: typeof source.snap_token === "string" ? source.snap_token : undefined,
        customer:
            source.customer && typeof source.customer === "object"
                ? {
                    name: typeof source.customer.name === "string" ? source.customer.name : "",
                    email: typeof source.customer.email === "string" ? source.customer.email : "",
                    phone: typeof source.customer.phone === "string" ? source.customer.phone : "",
                }
                : { name: "", email: "", phone: "" },
        payment_method: typeof source.payment_method === "string" ? source.payment_method : undefined,
        payment_name: typeof source.payment_name === "string" ? source.payment_name : undefined,
        payment_va: typeof source.payment_va === "string" ? source.payment_va : undefined,
        transaction_id: typeof source.transaction_id === "string" ? source.transaction_id : undefined,
    };
}

export async function fetchPublicOrderById(orderId: string): Promise<Orders | null> {
    if (!orderId) return null;

    try {
        const response = await fetch(`/api/payment/orders/public?order_id=${encodeURIComponent(orderId)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) return null;

        const data = (await response.json()) as { order?: unknown };
        return normalizePublicOrder(data.order);
    } catch {
        return null;
    }
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