import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

vi.mock('@/src/server/lib/rateLimit', () => ({
    checkRateLimit: vi.fn(),
    getRequestIp: vi.fn(),
    buildRateLimitHeaders: vi.fn(),
}));

vi.mock('@/src/server/providers/midtransProvider', () => ({
    midtransProvider: {
        checkTransaction: vi.fn(),
    },
}));

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSession: vi.fn(),
}));

import { GET, POST } from '@/src/app/api/payment/transaction-status/route';
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from '@/src/server/lib/rateLimit';
import { midtransProvider } from '@/src/server/providers/midtransProvider';
import { requireSession } from '@/src/lib/auth/withAuth';

function makeGetRequest(url: string): NextRequest {
    return {
        url,
        headers: new Headers(),
    } as unknown as NextRequest;
}

function makePostRequest(body: unknown): NextRequest {
    return {
        json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
}

describe('payment transaction-status route', () => {
    it('GET returns 429 when rate limit exceeded', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, limit: 30, remaining: 0, retryAfter: 30 });
        vi.mocked(buildRateLimitHeaders).mockReturnValue({ 'Retry-After': '30' });

        const response = await GET(makeGetRequest('http://localhost:3000/api/payment/transaction-status?order_id=ORDER-12345'));
        expect(response.status).toBe(429);
    });

    it('GET validates order_id format', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, limit: 30, remaining: 29, retryAfter: 60 });

        const response = await GET(makeGetRequest('http://localhost:3000/api/payment/transaction-status?order_id=bad'));
        expect(response.status).toBe(400);
    });

    it('GET returns provider transaction data', async () => {
        vi.mocked(getRequestIp).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, limit: 30, remaining: 29, retryAfter: 60 });
        vi.mocked(midtransProvider.checkTransaction).mockResolvedValue({ order_id: 'ORDER-12345', transaction_status: 'pending' });

        const response = await GET(makeGetRequest('http://localhost:3000/api/payment/transaction-status?order_id=ORDER-12345'));
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ order_id: 'ORDER-12345' });
    });

    it('POST returns auth response when not authenticated', async () => {
        vi.mocked(requireSession).mockResolvedValue(NextResponse.json({ success: false }, { status: 401 }));

        const response = await POST(makePostRequest({ order_ids: ['ORDER-12345'] }));
        expect(response.status).toBe(401);
    });

    it('POST returns transaction list for valid session', async () => {
        vi.mocked(requireSession).mockResolvedValue({ userId: 'admin-1', role: 'admin' });
        vi.mocked(midtransProvider.checkTransaction).mockResolvedValue({ transaction_status: 'settlement' });

        const response = await POST(makePostRequest({ order_ids: ['ORDER-12345'] }));
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ transactions: [{ transaction_status: 'settlement' }] });
    });
});
