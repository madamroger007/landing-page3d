/**
 * Cached Voucher Repository
 * 
 * Repository layer with Redis caching.
 * Check cache first, then query database if not found.
 */

import { eq } from 'drizzle-orm';
import { db } from '@/src/server/db';
import { InsertVoucher, SelectVoucher, voucherTable } from '@/src/server/db/schema/voucher';
import { getCache, setCache, deleteCache, deleteCacheByPattern } from '@/src/server/lib/cache';

// ─── Cache TTL ───────────────────────────────────────────────────────────────

const CACHE_TTL = {
    MEDIUM: 300,     // 5 minutes
    LONG: 3600,      // 1 hour
};

// ─── Cached Voucher Repository ───────────────────────────────────────────────

export const cachedVoucherRepository = {
    /**
     * Get all vouchers
     */
    async getVouchers(): Promise<SelectVoucher[]> {
        const cacheKey = 'vouchers:all';

        const cached = await getCache<SelectVoucher[]>(cacheKey);
        if (cached) return cached;

        const vouchers = await db.select().from(voucherTable);

        if (vouchers.length > 0) {
            await setCache(cacheKey, vouchers, CACHE_TTL.MEDIUM);
        }

        return vouchers;
    },

    /**
     * Get voucher by ID
     */
    async getVoucherById(id: number | undefined): Promise<SelectVoucher | undefined> {
        if (!id) return undefined;

        const cacheKey = `vouchers:id:${id}`;

        const cached = await getCache<SelectVoucher>(cacheKey);
        if (cached) return cached;

        const [voucher] = await db
            .select()
            .from(voucherTable)
            .where(eq(voucherTable.id, id))
            .limit(1);

        if (voucher) {
            await setCache(cacheKey, voucher, CACHE_TTL.LONG);
        }

        return voucher;
    },

    /**
     * Get voucher by code
     */
    async getVoucherByCode(code: string): Promise<SelectVoucher | undefined> {
        const cacheKey = `vouchers:code:${code}`;

        const cached = await getCache<SelectVoucher>(cacheKey);
        if (cached) return cached;

        const [voucher] = await db
            .select()
            .from(voucherTable)
            .where(eq(voucherTable.code, code))
            .limit(1);

        if (voucher) {
            await setCache(cacheKey, voucher, CACHE_TTL.LONG);
        }

        return voucher;
    },

    /**
     * Create a new voucher
     */
    async createVoucher(data: InsertVoucher): Promise<void> {
        await db.insert(voucherTable).values(data);

        // Invalidate list cache
        await deleteCacheByPattern('vouchers:*');
    },

    /**
     * Update an existing voucher
     */
    async updateVoucher(data: SelectVoucher): Promise<void> {
        await db.update(voucherTable).set(data).where(eq(voucherTable.id, data.id));

        // Invalidate specific and list caches
        await deleteCache(`vouchers:id:${data.id}`);
        await deleteCache(`vouchers:code:${data.code}`);
        await deleteCacheByPattern('vouchers:all');
    },

    /**
     * Delete a voucher
     */
    async deleteVoucher(id: number): Promise<void> {
        // Get voucher first to invalidate code cache
        const voucher = await this.getVoucherById(id);

        await db.delete(voucherTable).where(eq(voucherTable.id, id));

        // Invalidate caches
        await deleteCache(`vouchers:id:${id}`);
        if (voucher) {
            await deleteCache(`vouchers:code:${voucher.code}`);
        }
        await deleteCacheByPattern('vouchers:all');
    },
};
