/**
 * Orders Repository
 * 
 * Repository layer for orders/transactions.
 */

import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/src/server/db';
import { InsertOrder, SelectOrder, ordersTable } from '@/src/server/db/schema/orders';
import { CACHE_KEYS, CACHE_TTL, cacheAside, invalidateOrderCache } from '@/src/server/lib/cache';

// ─── Orders Repository ───────────────────────────────────────────────────────

export const ordersRepository = {
    /**
     * Get all orders (most recent first)
     */
    async getAllOrders(limit: number = 50): Promise<SelectOrder[]> {
        return cacheAside(
            CACHE_KEYS.ORDERS_ALL(limit),
            async () =>
                await db
                    .select()
                    .from(ordersTable)
                    .orderBy(desc(ordersTable.createdAt))
                    .limit(limit),
            CACHE_TTL.SHORT
        );
    },

    async getOrdersByStatus(status: string, limit: number = 50): Promise<SelectOrder[]> {
        return cacheAside(
            CACHE_KEYS.ORDERS_BY_STATUS(status, limit),
            async () =>
                await db
                    .select()
                    .from(ordersTable)
                    .where(eq(ordersTable.transactionStatus, status))
                    .orderBy(desc(ordersTable.createdAt))
                    .limit(limit),
            CACHE_TTL.SHORT
        );
    },

    /**
     * Get order by order_id
     */
    async getOrderByOrderId(orderId: string): Promise<SelectOrder | undefined> {
        const order = await cacheAside(
            CACHE_KEYS.ORDER_BY_ID(orderId),
            async () => {
                const [item] = await db
                    .select()
                    .from(ordersTable)
                    .where(eq(ordersTable.orderId, orderId))
                    .limit(1);

                return item ?? null;
            },
            CACHE_TTL.MEDIUM
        );

        return order ?? undefined;
    },

    async getOrdersByOrderIds(orderIds: string[]): Promise<SelectOrder[]> {
        if (orderIds.length === 0) return [];

        const uniqueOrderIds = [...new Set(orderIds)];

        return cacheAside(
            CACHE_KEYS.ORDERS_BY_IDS(uniqueOrderIds),
            async () =>
                await db
                    .select()
                    .from(ordersTable)
                    .where(inArray(ordersTable.orderId, uniqueOrderIds))
                    .orderBy(desc(ordersTable.createdAt)),
            CACHE_TTL.SHORT
        );
    },

    /**
     * Create a new order
     */
    async createOrder(order: InsertOrder): Promise<SelectOrder> {
        const [newOrder] = await db
            .insert(ordersTable)
            .values(order)
            .returning();

        await invalidateOrderCache(order.orderId);

        return newOrder;
    },

    /**
     * Update order status (from Midtrans notification or status check)
     */
    async updateOrderStatus(
        orderId: string,
        data: Partial<InsertOrder>
    ): Promise<SelectOrder | undefined> {
        const [updated] = await db
            .update(ordersTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(ordersTable.orderId, orderId))
            .returning();

        await invalidateOrderCache(orderId);

        return updated;
    },

    async updateOrderLabel(orderId: string, label: string): Promise<SelectOrder | undefined> {
        const [updated] = await db
            .update(ordersTable)
            .set({ orderLabel: label, updatedAt: new Date() })
            .where(eq(ordersTable.orderId, orderId))
            .returning();

        await invalidateOrderCache(orderId);

        return updated;
    },

    async updateOrderWorkflow(
        orderId: string,
        data: { orderLabel?: string; productLink?: string | null }
    ): Promise<SelectOrder | undefined> {
        const patch: Partial<InsertOrder> = { updatedAt: new Date() };

        if (typeof data.orderLabel === 'string') {
            patch.orderLabel = data.orderLabel;
        }

        if (Object.prototype.hasOwnProperty.call(data, 'productLink')) {
            patch.productLink = data.productLink ?? null;
        }

        const [updated] = await db
            .update(ordersTable)
            .set(patch)
            .where(eq(ordersTable.orderId, orderId))
            .returning();

        await invalidateOrderCache(orderId);

        return updated;
    },

    /**
     * Update order with Midtrans response data
     */
    async updateFromMidtrans(
        orderId: string,
        midtransData: {
            transaction_id?: string;
            transaction_status?: string;
            payment_type?: string;
            payment_name?: string | null;
            payment_va?: string | null;
            fraud_status?: string;
            transaction_time?: string;
            settlement_time?: string;
        }
    ): Promise<SelectOrder | undefined> {
        const updateData: Partial<InsertOrder> = {
            updatedAt: new Date(),
        };

        if (midtransData.transaction_id !== undefined) {
            updateData.transactionId = midtransData.transaction_id;
        }

        if (midtransData.transaction_status !== undefined) {
            updateData.transactionStatus = midtransData.transaction_status;
        }

        if (midtransData.payment_type !== undefined) {
            updateData.paymentType = midtransData.payment_type;
        }

        if (midtransData.payment_name !== undefined) {
            updateData.paymentName = midtransData.payment_name;
        }

        if (midtransData.payment_va !== undefined) {
            updateData.paymentVa = midtransData.payment_va;
        }

        if (midtransData.fraud_status !== undefined) {
            updateData.fraudStatus = midtransData.fraud_status;
        }

        if (midtransData.transaction_time !== undefined) {
            updateData.transactionTime = midtransData.transaction_time;
        }

        if (midtransData.settlement_time !== undefined) {
            updateData.settlementTime = midtransData.settlement_time;
        }

        const [updated] = await db
            .update(ordersTable)
            .set(updateData)
            .where(eq(ordersTable.orderId, orderId))
            .returning();

        await invalidateOrderCache(orderId);

        return updated;
    },

    /**
     * Delete order by order_id
     */
    async deleteOrder(orderId: string): Promise<boolean> {
        const deleted = await db
            .delete(ordersTable)
            .where(eq(ordersTable.orderId, orderId))
            .returning();

        await invalidateOrderCache(orderId);

        return deleted.length > 0;
    },
};
