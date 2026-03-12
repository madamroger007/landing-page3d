/**
 * Orders Repository
 * 
 * Repository layer for orders/transactions.
 */

import { desc, eq } from 'drizzle-orm';
import { db } from '@/src/server/db';
import { InsertOrder, SelectOrder, ordersTable } from '@/src/server/db/schema/orders';

// ─── Orders Repository ───────────────────────────────────────────────────────

export const ordersRepository = {
    /**
     * Get all orders (most recent first)
     */
    async getAllOrders(limit: number = 50): Promise<SelectOrder[]> {
        return await db
            .select()
            .from(ordersTable)
            .orderBy(desc(ordersTable.createdAt))
            .limit(limit);
    },

    /**
     * Get order by order_id
     */
    async getOrderByOrderId(orderId: string): Promise<SelectOrder | undefined> {
        const [order] = await db
            .select()
            .from(ordersTable)
            .where(eq(ordersTable.orderId, orderId))
            .limit(1);

        return order;
    },

    /**
     * Create a new order
     */
    async createOrder(order: InsertOrder): Promise<SelectOrder> {
        const [newOrder] = await db
            .insert(ordersTable)
            .values(order)
            .returning();

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
            fraud_status?: string;
            transaction_time?: string;
            settlement_time?: string;
        }
    ): Promise<SelectOrder | undefined> {
        const [updated] = await db
            .update(ordersTable)
            .set({
                transactionId: midtransData.transaction_id,
                transactionStatus: midtransData.transaction_status,
                paymentType: midtransData.payment_type,
                fraudStatus: midtransData.fraud_status,
                transactionTime: midtransData.transaction_time,
                settlementTime: midtransData.settlement_time,
                updatedAt: new Date(),
            })
            .where(eq(ordersTable.orderId, orderId))
            .returning();

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

        return deleted.length > 0;
    },
};
