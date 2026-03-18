import {
    cachedProductRepository,
    SelectCategory,

} from '@/src/server/repositories/products/cached';
import { SelectProduct, InsertProduct } from '@/src/server/db/schema/products';
import { ProductSchema, UpdateProductSchema, CategorySchema } from '@/src/server/validations/products';
import { cachedToolRepository } from '@/src/server/repositories/tools/cached';
import { SelectTool } from '@/src/server/db/schema/tools';

export type ProductWithTools = SelectProduct & {
    tools: SelectTool[];
    toolIds: number[];
};

// ─── Product Service ─────────────────────────────────────────────────────────

export const productService = {
    async enrichProduct(product: SelectProduct): Promise<ProductWithTools> {
        const tools = await cachedToolRepository.getToolsByProductId(product.id);
        return {
            ...product,
            tools,
            toolIds: tools.map((tool) => tool.id),
        };
    },

    // ── Products ───────────────────────────────────────────────────────────

    async getProducts(): Promise<ProductWithTools[]> {
        const products = await cachedProductRepository.getProducts();
        return Promise.all(products.map((product) => this.enrichProduct(product)));
    },

    async getProductById(id: number): Promise<ProductWithTools | null> {
        const product = await cachedProductRepository.getProductById(id);
        if (!product) return null;
        return this.enrichProduct(product);
    },

    async createProduct(data: ProductSchema): Promise<ProductWithTools | { error: string }> {
        const toolIds = data.toolIds ?? [];
        const isValidToolIds = await cachedToolRepository.validateToolIds(toolIds);
        if (!isValidToolIds) {
            return { error: 'One or more selected tools are invalid' };
        }

        const now = new Date().toISOString();

        const productData: InsertProduct = {
            name: data.name,
            price: data.price,
            description: data.description,
            image: data.image ?? null,
            videoUrl: data.videoUrl ?? null,
            category: data.category ?? null,
            likes: 0,
            createdAt: now,
        };

        const created = await cachedProductRepository.createProduct(productData);
        await cachedToolRepository.replaceProductTools(created.id, toolIds);

        return this.enrichProduct(created);
    },

    async updateProduct(id: number, data: UpdateProductSchema): Promise<ProductWithTools | null | { error: string }> {
        const existing = await cachedProductRepository.getProductById(id);
        if (!existing) return null;

        if (data.toolIds !== undefined) {
            const isValidToolIds = await cachedToolRepository.validateToolIds(data.toolIds);
            if (!isValidToolIds) {
                return { error: 'One or more selected tools are invalid' };
            }
        }

        const updated = await cachedProductRepository.updateProduct(id, {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.image !== undefined && { image: data.image }),
            ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
            ...(data.category !== undefined && { category: data.category }),
        });

        if (!updated) return null;

        if (data.toolIds !== undefined) {
            await cachedToolRepository.replaceProductTools(id, data.toolIds);
        }

        return this.enrichProduct(updated);
    },

    async deleteProduct(id: number): Promise<boolean> {
        const existing = await cachedProductRepository.getProductById(id);
        if (!existing) return false;

        await cachedProductRepository.deleteProduct(id);
        return true;
    },

    async searchProducts(query: string): Promise<SelectProduct[]> {
        if (!query.trim()) return cachedProductRepository.getProducts();
        return cachedProductRepository.searchProducts(query);
    },

    async getProductsByCategory(category: string): Promise<SelectProduct[]> {
        return cachedProductRepository.getProductsByCategory(category);
    },

    async likeProduct(id: number): Promise<SelectProduct | null> {
        const updated = await cachedProductRepository.incrementLikes(id);
        return updated ?? null;
    },

    // ── Categories ─────────────────────────────────────────────────────────

    async getCategories(): Promise<SelectCategory[]> {
        return cachedProductRepository.getCategories();
    },

    async getCategoryById(id: number): Promise<SelectCategory | null> {
        const category = await cachedProductRepository.getCategoryById(id);
        return category ?? null;
    },

    async createCategory(data: CategorySchema): Promise<SelectCategory | { error: string }> {
        const existing = await cachedProductRepository.getCategoryByName(data.name);
        if (existing) {
            return { error: 'Category with this name already exists' };
        }

        const now = new Date().toISOString();
        return cachedProductRepository.createCategory({
            name: data.name,
            createdAt: now,
            updatedAt: now,
        });
    },

    async updateCategory(id: number, data: CategorySchema): Promise<SelectCategory | null | { error: string }> {
        const existing = await cachedProductRepository.getCategoryById(id);
        if (!existing) return null;

        // Check if name already exists on another category
        const duplicate = await cachedProductRepository.getCategoryByName(data.name);
        if (duplicate && duplicate.id !== id) {
            return { error: 'Category with this name already exists' };
        }

        const now = new Date().toISOString();
        const updated = await cachedProductRepository.updateCategory(id, {
            name: data.name,
            updatedAt: now,
        });

        return updated ?? null;
    },

    async deleteCategory(id: number): Promise<boolean> {
        const existing = await cachedProductRepository.getCategoryById(id);
        if (!existing) return false;

        await cachedProductRepository.deleteCategory(id);
        return true;
    },
};
