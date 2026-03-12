import { getCacheClient } from './redis';

// ─── Cache Key Prefixes ──────────────────────────────────────────────────────

export const CACHE_KEYS = {
    // Products
    PRODUCTS_ALL: 'products:all',
    PRODUCT_BY_ID: (id: number) => `products:${id}`,
    PRODUCTS_BY_CATEGORY: (category: string) => `products:category:${category}`,

    // Categories
    CATEGORIES_ALL: 'categories:all',
    CATEGORY_BY_ID: (id: number) => `categories:${id}`,

    // Vouchers
    VOUCHERS_ALL: 'vouchers:all',
    VOUCHER_BY_ID: (id: number) => `vouchers:${id}`,
    VOUCHER_BY_CODE: (code: string) => `vouchers:code:${code}`,
} as const;

// ─── Default TTLs (in seconds) ───────────────────────────────────────────────

export const CACHE_TTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 3600,          // 1 hour
    VERY_LONG: 86400,    // 24 hours
} as const;

// ─── Cache Operations ────────────────────────────────────────────────────────

/**
 * Get a cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const client = getCacheClient();
        const data = await client.get(key);

        if (!data) return null;

        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`[Cache] Error getting key "${key}":`, error);
        return null;
    }
}

/**
 * Set a cached value with optional TTL
 */
export async function setCache<T>(
    key: string,
    value: T,
    ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<void> {
    try {
        const client = getCacheClient();
        const serialized = JSON.stringify(value);

        await client.setex(key, ttlSeconds, serialized);
    } catch (error) {
        console.error(`[Cache] Error setting key "${key}":`, error);
    }
}

/**
 * Delete a cached value
 */
export async function deleteCache(key: string): Promise<void> {
    try {
        const client = getCacheClient();
        await client.del(key);
    } catch (error) {
        console.error(`[Cache] Error deleting key "${key}":`, error);
    }
}

/**
 * Delete multiple cached values by pattern
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
    try {
        const client = getCacheClient();
        const keys = await client.keys(pattern);

        if (keys.length > 0) {
            await client.del(...keys);
        }
    } catch (error) {
        console.error(`[Cache] Error deleting keys by pattern "${pattern}":`, error);
    }
}

/**
 * Invalidate all product-related cache
 */
export async function invalidateProductCache(): Promise<void> {
    await deleteCacheByPattern('products:*');
}

/**
 * Invalidate all category-related cache
 */
export async function invalidateCategoryCache(): Promise<void> {
    await deleteCacheByPattern('categories:*');
}

/**
 * Invalidate all voucher-related cache
 */
export async function invalidateVoucherCache(): Promise<void> {
    await deleteCacheByPattern('vouchers:*');
}

// ─── Cache-Aside Pattern Helper ──────────────────────────────────────────────

/**
 * Get from cache or fetch from source and cache the result
 */
export async function cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<T> {
    // Try to get from cache first
    const cached = await getCache<T>(key);
    if (cached !== null) {
        return cached;
    }

    // Fetch from source
    const data = await fetcher();

    // Cache the result (don't await to avoid blocking)
    setCache(key, data, ttlSeconds).catch(() => {
        // Silently fail - caching is best-effort
    });

    return data;
}
