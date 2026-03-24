import { NextRequest } from 'next/server';
import { getCacheClient } from './redis';

type MemoryBucket = {
    count: number;
    resetAt: number;
};

export type RateLimitResult = {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfter: number;
};

const memoryStore = new Map<string, MemoryBucket>();

function cleanupMemoryStore(): void {
    const now = Date.now();

    for (const [key, bucket] of memoryStore.entries()) {
        if (bucket.resetAt <= now) {
            memoryStore.delete(key);
        }
    }
}

function checkMemoryRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
    cleanupMemoryStore();

    const fullKey = `rate-limit:${key}`;
    const current = memoryStore.get(fullKey);
    const nowMs = Date.now();

    if (!current || current.resetAt <= nowMs) {
        memoryStore.set(fullKey, {
            count: 1,
            resetAt: nowMs + windowSeconds * 1000,
        });

        return {
            allowed: true,
            limit,
            remaining: Math.max(limit - 1, 0),
            retryAfter: windowSeconds,
        };
    }

    current.count += 1;
    const retryAfter = Math.max(Math.ceil((current.resetAt - nowMs) / 1000), 1);

    return {
        allowed: current.count <= limit,
        limit,
        remaining: Math.max(limit - current.count, 0),
        retryAfter,
    };
}

export async function checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<RateLimitResult> {
    const fullKey = `rate-limit:${key}`;

    try {
        const client = getCacheClient();
        const count = await client.incr(fullKey);

        if (count === 1) {
            await client.expire(fullKey, windowSeconds);
        }

        let ttl = await client.ttl(fullKey);
        if (ttl <= 0) {
            await client.expire(fullKey, windowSeconds);
            ttl = windowSeconds;
        }

        return {
            allowed: count <= limit,
            limit,
            remaining: Math.max(limit - count, 0),
            retryAfter: Math.max(ttl, 1),
        };
    } catch {
        return checkMemoryRateLimit(key, limit, windowSeconds);
    }
}

export function getRequestIp(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    if (realIp) {
        return realIp.trim();
    }

    if (cfIp) {
        return cfIp.trim();
    }

    return 'unknown';
}

export function buildRateLimitHeaders(result: RateLimitResult): HeadersInit {
    return {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'Retry-After': String(result.retryAfter),
    };
}
