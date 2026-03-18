import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/src/server/db';
import {
    InsertProductTool,
    InsertTool,
    productToolsTable,
    SelectTool,
    toolsTable,
} from '@/src/server/db/schema/tools';
import { deleteCache, deleteCacheByPattern, getCache, setCache } from '@/src/server/lib/cache';

const CACHE_TTL = {
    SHORT: 60,
    LONG: 3600,
};

export const cachedToolRepository = {
    async getTools(): Promise<SelectTool[]> {
        const cacheKey = 'tools:all';
        const cached = await getCache<SelectTool[]>(cacheKey);
        if (cached) return cached;

        const tools = await db.select().from(toolsTable).orderBy(asc(toolsTable.name));
        if (tools.length > 0) {
            await setCache(cacheKey, tools, CACHE_TTL.LONG);
        }

        return tools;
    },

    async getToolById(id: number): Promise<SelectTool | undefined> {
        const cacheKey = `tools:id:${id}`;
        const cached = await getCache<SelectTool>(cacheKey);
        if (cached) return cached;

        const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.id, id));
        if (tool) {
            await setCache(cacheKey, tool, CACHE_TTL.LONG);
        }

        return tool;
    },

    async getToolByName(name: string): Promise<SelectTool | undefined> {
        const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.name, name));
        return tool;
    },

    async createTool(data: InsertTool): Promise<SelectTool> {
        const [tool] = await db.insert(toolsTable).values(data).returning();
        await deleteCacheByPattern('tools:*');
        return tool;
    },

    async updateTool(id: number, data: Partial<Omit<InsertTool, 'id'>>): Promise<SelectTool | undefined> {
        const [tool] = await db.update(toolsTable).set(data).where(eq(toolsTable.id, id)).returning();
        if (tool) {
            await deleteCache(`tools:id:${id}`);
            await deleteCacheByPattern('tools:all');
            await deleteCacheByPattern('product:tools:*');
        }

        return tool;
    },

    async deleteTool(id: number): Promise<void> {
        await db.delete(toolsTable).where(eq(toolsTable.id, id));
        await deleteCache(`tools:id:${id}`);
        await deleteCacheByPattern('tools:all');
        await deleteCacheByPattern('product:tools:*');
    },

    async getToolsByProductId(productId: number): Promise<SelectTool[]> {
        const cacheKey = `product:tools:${productId}`;
        const cached = await getCache<SelectTool[]>(cacheKey);
        if (cached) return cached;

        const rows = await db
            .select({
                id: toolsTable.id,
                name: toolsTable.name,
                createdAt: toolsTable.createdAt,
                updatedAt: toolsTable.updatedAt,
            })
            .from(productToolsTable)
            .innerJoin(toolsTable, eq(productToolsTable.toolId, toolsTable.id))
            .where(eq(productToolsTable.productId, productId))
            .orderBy(asc(toolsTable.name));

        if (rows.length > 0) {
            await setCache(cacheKey, rows, CACHE_TTL.SHORT);
        }

        return rows;
    },

    async getToolIdsByProductId(productId: number): Promise<number[]> {
        const rows = await db
            .select({ toolId: productToolsTable.toolId })
            .from(productToolsTable)
            .where(eq(productToolsTable.productId, productId));

        return rows.map((row) => row.toolId);
    },

    async replaceProductTools(productId: number, toolIds: number[]): Promise<void> {
        await db.delete(productToolsTable).where(eq(productToolsTable.productId, productId));

        if (toolIds.length > 0) {
            const now = new Date().toISOString();
            const values: InsertProductTool[] = toolIds.map((toolId) => ({
                productId,
                toolId,
                createdAt: now,
            }));
            await db.insert(productToolsTable).values(values);
        }

        await deleteCache(`product:tools:${productId}`);
        await deleteCacheByPattern('products:*');
    },

    async validateToolIds(toolIds: number[]): Promise<boolean> {
        if (toolIds.length === 0) return true;

        const rows = await db
            .select({ id: toolsTable.id })
            .from(toolsTable)
            .where(inArray(toolsTable.id, toolIds));

        return rows.length === new Set(toolIds).size;
    },
};
