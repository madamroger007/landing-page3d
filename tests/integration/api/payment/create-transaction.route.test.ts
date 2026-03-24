import { describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { SelectOrder } from '@/src/server/db/schema/orders';

vi.mock('@/src/server/services/payment', () => ({
    createPaymentWithCoreApi: vi.fn(),
    createPaymentService: vi.fn(),
}));

vi.mock('@/src/server/repositories/orders', () => ({
    ordersRepository: {
        getOrderByOrderId: vi.fn(),
    },
}));

vi.mock('@/src/server/lib/rateLimit', () => ({
    checkRateLimit: vi.fn(),
    getRequestIp: vi.fn(),
    buildRateLimitHeaders: vi.fn(),
}));

import { POST } from '@/src/app/api/payment/create-transaction/route';
import { createPaymentService, createPaymentWithCoreApi } from '@/src/server/services/payment';
import { ordersRepository } from '@/src/server/repositories/orders';
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from '@/src/server/lib/rateLimit';

function makeRequest(body: unknown, contentType = 'application/json'): NextRequest {
    return {
        headers: new Headers({ 'content-type': contentType }),
        json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
}

function makeExistingOrder(): SelectOrder {
    return {
        id: 1,
        orderId: 'ORDER-12345',
        grossAmount: 100000,
        snapToken: null,
        paymentType: 'qris',
        paymentName: 'qris',
        paymentVa: null,
        transactionStatus: 'pending',
        transactionId: null,
        fraudStatus: null,
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '0812',
        items: '[]',
        createdAt: new Date(),
        updatedAt: new Date(),
        transactionTime: null,
        settlementTime: null,
        orderLabel: 'progress',
        productLink: null,
    };
}

describe('POST /api/payment/create-transaction', () => {
    it('returns 429 when rate limit is exceeded', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({
            allowed: false,
            limit: 20,
            remaining: 0,
            retryAfter: 30,
        });
        vi.mocked(buildRateLimitHeaders).mockReturnValue({ 'Retry-After': '30' });

        const response = await POST(makeRequest({}));

        expect(response.status).toBe(429);
    });

    it('returns 415 for unsupported content type', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({
            allowed: true,
            limit: 20,
            remaining: 19,
            retryAfter: 60,
        });

        const response = await POST(makeRequest({}, 'text/plain'));

        expect(response.status).toBe(415);
    });

    it('returns 409 when order already exists', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({
            allowed: true,
            limit: 20,
            remaining: 19,
            retryAfter: 60,
        });
        vi.mocked(ordersRepository.getOrderByOrderId).mockResolvedValue(makeExistingOrder());

        const response = await POST(
            makeRequest({
                order_id: 'ORDER-12345',
                gross_amount: 100000,
                items: [],
                customer: { name: 'Test', email: 'test@example.com' },
            })
        );

        expect(response.status).toBe(409);
        await expect(response.json()).resolves.toMatchObject({
            error: 'Order already exists',
            order_id: 'ORDER-12345',
        });
    });

    it('returns 200 and persists payment when payload is valid', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({
            allowed: true,
            limit: 20,
            remaining: 19,
            retryAfter: 60,
        });
        vi.mocked(ordersRepository.getOrderByOrderId).mockResolvedValue(undefined);
        vi.mocked(createPaymentWithCoreApi).mockResolvedValue({
            order_id: 'ORDER-12345',
            transaction_status: 'pending',
            payment_method: 'qris',
            payment_name: 'qris',
            payment_va: null,
            payment_data: { raw_snap_result: { gross_amount: 100000 }, transaction_id: 'trx-1' },
        } as Awaited<ReturnType<typeof createPaymentWithCoreApi>>);

        const response = await POST(
            makeRequest({
                order_id: 'ORDER-12345',
                gross_amount: 100000,
                items: [{ id: 1, name: 'Item A', price: 100000, quantity: 1 }],
                customer: { name: 'Test', email: 'test@example.com', phone: '0812' },
            })
        );

        expect(response.status).toBe(200);
        expect(createPaymentService).toHaveBeenCalledTimes(1);
        await expect(response.json()).resolves.toMatchObject({
            order_id: 'ORDER-12345',
            status: 'pending',
        });
    });
});
