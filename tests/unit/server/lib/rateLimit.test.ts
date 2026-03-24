import { describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/src/server/lib/redis', () => ({
    getCacheClient: vi.fn(),
}));

import { getCacheClient } from '@/src/server/lib/redis';
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from '@/src/server/lib/rateLimit';

function makeRequest(headers: Record<string, string>): NextRequest {
    return {
        headers: new Headers(headers),
    } as unknown as NextRequest;
}

describe('rateLimit utils', () => {
    it('uses redis backend when available', async () => {
        vi.mocked(getCacheClient).mockReturnValue({
            incr: vi.fn().mockResolvedValue(1),
            expire: vi.fn().mockResolvedValue(1),
            ttl: vi.fn().mockResolvedValue(60),
        } as unknown as ReturnType<typeof getCacheClient>);

        const result = await checkRateLimit('redis-key', 5, 60);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
        expect(result.retryAfter).toBe(60);
    });

    it('falls back to in-memory backend when redis fails', async () => {
        vi.mocked(getCacheClient).mockImplementation(() => {
            throw new Error('redis unavailable');
        });

        const first = await checkRateLimit('memory-key', 2, 60);
        const second = await checkRateLimit('memory-key', 2, 60);
        const third = await checkRateLimit('memory-key', 2, 60);

        expect(first.allowed).toBe(true);
        expect(second.allowed).toBe(true);
        expect(third.allowed).toBe(false);
    });

    it('extracts request ip from forwarding headers', () => {
        const withForwarded = getRequestIp(makeRequest({ 'x-forwarded-for': '10.1.2.3, 1.1.1.1' }));
        const withReal = getRequestIp(makeRequest({ 'x-real-ip': '20.1.2.3' }));
        const unknown = getRequestIp(makeRequest({}));

        expect(withForwarded).toBe('10.1.2.3');
        expect(withReal).toBe('20.1.2.3');
        expect(unknown).toBe('unknown');
    });

    it('builds rate limit response headers', () => {
        const headers = buildRateLimitHeaders({
            allowed: false,
            limit: 10,
            remaining: 0,
            retryAfter: 30,
        });

        expect(headers).toEqual({
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '30',
        });
    });
});
