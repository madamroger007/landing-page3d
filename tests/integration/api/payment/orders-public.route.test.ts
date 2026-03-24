import { describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { SelectOrder } from '@/src/server/db/schema/orders';

vi.mock('@/src/server/repositories/orders', () => ({
    ordersRepository: {
        getOrdersByOrderIds: vi.fn(),
    },
}));

vi.mock('@/src/server/lib/rateLimit', () => ({
    checkRateLimit: vi.fn(),
    getRequestIp: vi.fn(),
    buildRateLimitHeaders: vi.fn(),
}));

import { POST } from '@/src/app/api/payment/orders/public/route';
import { ordersRepository } from '@/src/server/repositories/orders';
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from '@/src/server/lib/rateLimit';

function makeRequest(body: unknown): NextRequest {
    return {
        json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
}

function makeOrder(): SelectOrder {
    return {
        id: 1,
        orderId: 'ORDER-1',
        grossAmount: 100000,
        snapToken: null,
        paymentType: 'qris',
        paymentName: 'qris',
        paymentVa: null,
        transactionStatus: 'pending',
        transactionId: null,
        fraudStatus: null,
        customerName: 'Test User',
        customerEmail: 'hidden@example.com',
        customerPhone: '0812',
        items: '[]',
        createdAt: new Date(),
        updatedAt: new Date(),
        transactionTime: null,
        settlementTime: null,
        orderLabel: 'progress',
        productLink: 'https://example.com/file',
    };
}

describe('POST /api/payment/orders/public', () => {
    it('returns 429 when rate limit is exceeded', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({
            allowed: false,
            limit: 60,
            remaining: 0,
            retryAfter: 45,
        });
        vi.mocked(buildRateLimitHeaders).mockReturnValue({ 'Retry-After': '45' });

        const response = await POST(makeRequest({ order_ids: ['A'] }));

        expect(response.status).toBe(429);
    });

    it('returns normalized minimal fields and deduplicates IDs', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({
            allowed: true,
            limit: 60,
            remaining: 59,
            retryAfter: 60,
        });
        vi.mocked(ordersRepository.getOrdersByOrderIds).mockResolvedValue([makeOrder()]);

        const response = await POST(makeRequest({ order_ids: ['ORDER-1', 'ORDER-1'] }));

        expect(ordersRepository.getOrdersByOrderIds).toHaveBeenCalledWith(['ORDER-1']);
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            orders: [
                {
                    orderId: 'ORDER-1',
                    orderLabel: 'progress',
                    productLink: 'https://example.com/file',
                    transactionStatus: 'pending',
                },
            ],
        });
    });
});
