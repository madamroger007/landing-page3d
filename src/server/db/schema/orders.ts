import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const ordersTable = pgTable('orders', {
    id: serial('id').primaryKey(),
    orderId: text('order_id').notNull().unique(),
    grossAmount: integer('gross_amount').notNull(),
    snapToken: text('snap_token'),
    paymentType: text('payment_type'),
    paymentName: text('payment_name'),
    paymentVa: text('payment_va'),
    transactionStatus: text('transaction_status').default('pending'),
    transactionId: text('transaction_id'),
    fraudStatus: text('fraud_status'),
    // Customer details
    customerName: text('customer_name'),
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone'),
    // Items stored as JSON string
    items: text('items'),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    transactionTime: text('transaction_time'),
    settlementTime: text('settlement_time'),
    orderLabel: text('order_label').notNull().default('progress'),
    productLink: text('product_link'),
});

export type InsertOrder = typeof ordersTable.$inferInsert;
export type SelectOrder = typeof ordersTable.$inferSelect;
