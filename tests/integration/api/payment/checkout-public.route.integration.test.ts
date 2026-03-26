import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/src/server/db';
import { ordersTable } from '@/src/server/db/schema/orders';
import { ordersRepository } from '@/src/server/repositories/orders';

vi.mock('@/src/server/providers/midtransProvider', () => ({
    midtransProvider: {
        createCharge: vi.fn(),
        checkTransaction: vi.fn(),
    },
}));

vi.mock('@/src/server/services/email', () => ({
    SendPaymentLinkEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/src/server/lib/slack-error-reporter', () => ({
    reportErrorToSlack: vi.fn().mockResolvedValue(undefined),
}));

import { midtransProvider } from '@/src/server/providers/midtransProvider';
import { POST as createTransactionPOST } from '@/src/app/api/payment/create-transaction/route';
import { GET as publicOrderGET, POST as publicOrdersPOST } from '@/src/app/api/payment/orders/public/route';

describe('payment public checkout integration', () => {
    beforeEach(async () => {
        await db.delete(ordersTable);
        vi.clearAllMocks();
    });

    it('POST /api/payment/create-transaction persists order in database', async () => {
        vi.mocked(midtransProvider.createCharge).mockResolvedValue({
            payment_type: 'qris',
            transaction_status: 'pending',
            transaction_id: 'trx-1001',
            gross_amount: '100000',
            actions: [{ name: 'generate-qr-code', url: 'https://example.com/qr' }],
        } as never);

        const response = await createTransactionPOST(
            new Request('http://localhost/api/payment/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: 'ORDER-10001',
                    gross_amount: 100000,
                    items: [{ id: 1, name: 'Item A', price: 100000, quantity: 1 }],
                    customer: { name: 'Checkout User', email: 'checkout-user@example.com', phone: '081234' },
                    payment_method: 'qris',
                }),
            }) as never
        );

        expect(response.status).toBe(200);

        const persisted = await ordersRepository.getOrderByOrderId('ORDER-10001');
        expect(persisted).toBeDefined();
        expect(persisted?.transactionStatus).toBe('pending');
        expect(persisted?.paymentType).toBe('qris');
        expect(persisted?.transactionId).toBe('trx-1001');
    });

    it('POST /api/payment/create-transaction returns 409 for duplicate order id', async () => {
        await ordersRepository.createOrder({
            orderId: 'ORDER-20001',
            grossAmount: 150000,
            snapToken: null,
            items: JSON.stringify([{ id: 1, name: 'A', price: 150000, quantity: 1 }]),
            customerName: 'Existing User',
            customerEmail: 'existing@example.com',
            customerPhone: '0812',
            transactionStatus: 'pending',
            paymentType: 'qris',
            paymentName: 'QRIS',
            paymentVa: null,
            transactionId: null,
        });

        const response = await createTransactionPOST(
            new Request('http://localhost/api/payment/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: 'ORDER-20001',
                    gross_amount: 150000,
                    items: [{ id: 1, name: 'A', price: 150000, quantity: 1 }],
                    customer: { name: 'Existing User', email: 'existing@example.com', phone: '0812' },
                }),
            }) as never
        );

        expect(response.status).toBe(409);
    });

    it('GET /api/payment/orders/public returns normalized order payload', async () => {
        await ordersRepository.createOrder({
            orderId: 'ORDER-30001',
            grossAmount: 250000,
            snapToken: null,
            items: JSON.stringify([{ id: 2, name: 'Item B', price: 250000, quantity: 1 }]),
            customerName: 'Public User',
            customerEmail: 'public-user@example.com',
            customerPhone: '0813',
            transactionStatus: 'pending',
            paymentType: 'qris',
            paymentName: 'QRIS',
            paymentVa: null,
            transactionId: null,
            productLink: 'https://example.com/product-link',
        });

        const response = await publicOrderGET(
            new Request('http://localhost/api/payment/orders/public?order_id=ORDER-30001') as never
        );

        expect(response.status).toBe(200);
        const payload = (await response.json()) as { order: { order_id: string; customer: { email: string } } };
        expect(payload.order.order_id).toBe('ORDER-30001');
        expect(payload.order.customer.email).toBe('public-user@example.com');
    });

    it('POST /api/payment/orders/public returns deduplicated public order list', async () => {
        await ordersRepository.createOrder({
            orderId: 'ORDER-40001',
            grossAmount: 300000,
            snapToken: null,
            items: JSON.stringify([]),
            customerName: 'Bulk User',
            customerEmail: 'bulk-user@example.com',
            customerPhone: '0814',
            transactionStatus: 'pending',
            paymentType: 'qris',
            paymentName: 'QRIS',
            paymentVa: null,
            transactionId: null,
            orderLabel: 'progress',
        });

        const response = await publicOrdersPOST(
            new Request('http://localhost/api/payment/orders/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_ids: ['ORDER-40001', 'ORDER-40001'] }),
            }) as never
        );

        expect(response.status).toBe(200);
        const payload = (await response.json()) as { orders: Array<{ orderId: string }> };
        expect(payload.orders[0].orderId).toBe('ORDER-40001');
        expect(payload.orders.length).toBe(1);
    });
});
