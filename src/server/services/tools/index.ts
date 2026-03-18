import { cachedToolRepository } from '@/src/server/repositories/tools/cached';
import { InsertTool, SelectTool } from '@/src/server/db/schema/tools';
import { ToolSchema } from '@/src/server/validations/tools';

export const toolService = {
    async getTools(): Promise<SelectTool[]> {
        return cachedToolRepository.getTools();
    },

    async getToolById(id: number): Promise<SelectTool | null> {
        const tool = await cachedToolRepository.getToolById(id);
        return tool ?? null;
    },

    async createTool(data: ToolSchema): Promise<SelectTool | { error: string }> {
        const existing = await cachedToolRepository.getToolByName(data.name);
        if (existing) {
            return { error: 'Tool with this name already exists' };
        }

        const now = new Date().toISOString();
        const payload: InsertTool = {
            name: data.name,
            createdAt: now,
            updatedAt: now,
        };

        return cachedToolRepository.createTool(payload);
    },

    async updateTool(id: number, data: ToolSchema): Promise<SelectTool | null | { error: string }> {
        const existing = await cachedToolRepository.getToolById(id);
        if (!existing) return null;

        const duplicate = await cachedToolRepository.getToolByName(data.name);
        if (duplicate && duplicate.id !== id) {
            return { error: 'Tool with this name already exists' };
        }

        const now = new Date().toISOString();
        const updated = await cachedToolRepository.updateTool(id, {
            name: data.name,
            updatedAt: now,
        });

        return updated ?? null;
    },

    async deleteTool(id: number): Promise<boolean> {
        const existing = await cachedToolRepository.getToolById(id);
        if (!existing) return false;

        await cachedToolRepository.deleteTool(id);
        return true;
    },
};
