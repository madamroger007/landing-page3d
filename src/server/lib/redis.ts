import Redis from 'ioredis';

// ─── Redis Client Configuration ──────────────────────────────────────────────
// Supports both local Redis and Upstash Redis (Vercel)
// Upstash URL format: rediss://default:xxx@xxx.upstash.io:6379

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ─── Parse Redis URL ─────────────────────────────────────────────────────────

function parseRedisUrl(url: string) {
    const parsedUrl = new URL(url);
    const isUpstash = parsedUrl.hostname.includes('upstash.io');

    return {
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port || '6379'),
        password: parsedUrl.password || undefined,
        tls: isUpstash ? {} : undefined,  // Upstash requires TLS
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableReadyCheck: !isUpstash,  // Disable for Upstash
    };
}

// ─── Cache Redis Client ──────────────────────────────────────────────────────

let cacheClient: Redis | null = null;

export function getCacheClient(): Redis {
    if (!cacheClient) {
        cacheClient = new Redis(parseRedisUrl(REDIS_URL));

        cacheClient.on('error', (err) => {
            console.error('[Redis Cache] Connection error:', err.message);
        });

        cacheClient.on('connect', () => {
            console.log('[Redis Cache] Connected successfully');
        });
    }

    return cacheClient;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export async function closeRedisConnections(): Promise<void> {
    if (cacheClient) {
        await cacheClient.quit();
        cacheClient = null;
    }
}
