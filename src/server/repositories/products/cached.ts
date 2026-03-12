/**
 * Cached Product Repository
 * 
 * Repository layer with Redis caching.
 * Check cache first, then query database if not found.
 */

import { eq, ilike, desc } from 'drizzle-orm';
import { db } from '@/src/server/db';
import {
    productsTable,
    productCategoryTable,
    InsertProduct,
    SelectProduct,
} from '@/src/server/db/schema/products';
import { getCache, setCache, deleteCache, deleteCacheByPattern } from '@/src/server/lib/cache';

// ─── Cache Keys & TTL ────────────────────────────────────────────────────────

const CACHE_TTL = {
    SHORT: 60,       // 1 minute
    MEDIUM: 300,     // 5 minutes
    LONG: 3600,      // 1 hour
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type InsertCategory = typeof productCategoryTable.$inferInsert;
export type SelectCategory = typeof productCategoryTable.$inferSelect;

// ─── Cached Products Repository ──────────────────────────────────────────────

export const cachedProductRepository = {
    // ── Products CRUD ──────────────────────────────────────────────────────

    async getProducts(): Promise<SelectProduct[]> {
        const cacheKey = 'products:all';

        const cached = await getCache<SelectProduct[]>(cacheKey);
        if (cached) return cached;

        const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));

        if (products.length > 0) {
            await setCache(cacheKey, products, CACHE_TTL.MEDIUM);
        }

        return products;
    },

    async getProductById(id: number): Promise<SelectProduct | undefined> {
        const cacheKey = `products:id:${id}`;

        const cached = await getCache<SelectProduct>(cacheKey);
        if (cached) return cached;

        const [product] = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, id));

        if (product) {
            await setCache(cacheKey, product, CACHE_TTL.LONG);
        }

        return product;
    },

    async createProduct(data: InsertProduct): Promise<SelectProduct> {
        const [product] = await db.insert(productsTable).values(data).returning();

        // Invalidate list cache
        await deleteCacheByPattern('products:*');

        return product;
    },

    async updateProduct(
        id: number,
        data: Partial<Omit<InsertProduct, 'id'>>
    ): Promise<SelectProduct | undefined> {
        const [product] = await db
            .update(productsTable)
            .set(data)
            .where(eq(productsTable.id, id))
            .returning();

        if (product) {
            // Invalidate specific and list caches
            await deleteCache(`products:id:${id}`);
            await deleteCacheByPattern('products:all');
            await deleteCacheByPattern('products:category:*');
        }

        return product;
    },

    async deleteProduct(id: number): Promise<void> {
        await db.delete(productsTable).where(eq(productsTable.id, id));

        // Invalidate caches
        await deleteCache(`products:id:${id}`);
        await deleteCacheByPattern('products:all');
        await deleteCacheByPattern('products:category:*');
    },

    async searchProducts(query: string): Promise<SelectProduct[]> {
        // Don't cache search results - keep them fresh
        return db
            .select()
            .from(productsTable)
            .where(ilike(productsTable.name, `%${query}%`))
            .orderBy(desc(productsTable.createdAt));
    },

    async getProductsByCategory(category: string): Promise<SelectProduct[]> {
        const cacheKey = `products:category:${category}`;

        const cached = await getCache<SelectProduct[]>(cacheKey);
        if (cached) return cached;

        const products = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.category, category))
            .orderBy(desc(productsTable.createdAt));

        if (products.length > 0) {
            await setCache(cacheKey, products, CACHE_TTL.MEDIUM);
        }

        return products;
    },

    async incrementLikes(id: number): Promise<SelectProduct | undefined> {
        const product = await this.getProductById(id);
        if (!product) return undefined;

        const [updated] = await db
            .update(productsTable)
            .set({ likes: (product.likes ?? 0) + 1 })
            .where(eq(productsTable.id, id))
            .returning();

        if (updated) {
            // Only invalidate specific product cache (likes change frequently)
            await deleteCache(`products:id:${id}`);
        }

        return updated;
    },

    // ── Categories CRUD ────────────────────────────────────────────────────

    async getCategories(): Promise<SelectCategory[]> {
        const cacheKey = 'categories:all';

        const cached = await getCache<SelectCategory[]>(cacheKey);
        if (cached) return cached;

        const categories = await db
            .select()
            .from(productCategoryTable)
            .orderBy(productCategoryTable.name);

        if (categories.length > 0) {
            await setCache(cacheKey, categories, CACHE_TTL.LONG);
        }

        return categories;
    },

    async getCategoryById(id: number): Promise<SelectCategory | undefined> {
        const cacheKey = `categories:id:${id}`;

        const cached = await getCache<SelectCategory>(cacheKey);
        if (cached) return cached;

        const [category] = await db
            .select()
            .from(productCategoryTable)
            .where(eq(productCategoryTable.id, id));

        if (category) {
            await setCache(cacheKey, category, CACHE_TTL.LONG);
        }

        return category;
    },

    async getCategoryByName(name: string): Promise<SelectCategory | undefined> {
        // Don't cache by name - used for validation only
        const [category] = await db
            .select()
            .from(productCategoryTable)
            .where(eq(productCategoryTable.name, name));
        return category;
    },

    async createCategory(data: InsertCategory): Promise<SelectCategory> {
        const [category] = await db
            .insert(productCategoryTable)
            .values(data)
            .returning();

        // Invalidate list cache
        await deleteCacheByPattern('categories:*');

        return category;
    },

    async updateCategory(
        id: number,
        data: Partial<Omit<InsertCategory, 'id'>>
    ): Promise<SelectCategory | undefined> {
        const [category] = await db
            .update(productCategoryTable)
            .set(data)
            .where(eq(productCategoryTable.id, id))
            .returning();

        if (category) {
            await deleteCache(`categories:id:${id}`);
            await deleteCacheByPattern('categories:all');
        }

        return category;
    },

    async deleteCategory(id: number): Promise<void> {
        await db.delete(productCategoryTable).where(eq(productCategoryTable.id, id));

        await deleteCache(`categories:id:${id}`);
        await deleteCacheByPattern('categories:all');
    },
};
