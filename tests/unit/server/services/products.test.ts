import { describe, expect, it, vi } from 'vitest';
import type { SelectProduct } from '@/src/server/db/schema/products';

vi.mock('@/src/server/repositories/products/cached', () => ({
    cachedProductRepository: {
        getProducts: vi.fn(),
        getProductById: vi.fn(),
        createProduct: vi.fn(),
        updateProduct: vi.fn(),
        deleteProduct: vi.fn(),
        searchProducts: vi.fn(),
        getProductsByCategory: vi.fn(),
        incrementLikes: vi.fn(),
        getCategories: vi.fn(),
        getCategoryById: vi.fn(),
        getCategoryByName: vi.fn(),
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
    },
}));

vi.mock('@/src/server/repositories/tools/cached', () => ({
    cachedToolRepository: {
        getToolsByProductId: vi.fn(),
        validateToolIds: vi.fn(),
        replaceProductTools: vi.fn(),
    },
}));

import { cachedProductRepository } from '@/src/server/repositories/products/cached';
import { cachedToolRepository } from '@/src/server/repositories/tools/cached';
import { productService } from '@/src/server/services/products';

function makeProduct(overrides: Partial<SelectProduct> = {}): SelectProduct {
    return {
        id: 1,
        name: 'Product',
        price: 100000,
        description: 'Description',
        image: null,
        videoUrl: null,
        category: 'design',
        likes: 0,
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

describe('productService', () => {
    it('calculateProductPrice sums product totals', async () => {
        vi.mocked(cachedProductRepository.getProductById)
            .mockResolvedValueOnce(makeProduct({ id: 1, price: 100000 }))
            .mockResolvedValueOnce(makeProduct({ id: 2, price: 50000 }));

        const total = await productService.calculateProductPrice([
            { id: 1, quantity: 1 },
            { id: 2, quantity: 2 },
        ]);

        expect(total).toBe(200000);
    });

    it('calculateProductPrice returns null when product not found', async () => {
        vi.mocked(cachedProductRepository.getProductById).mockResolvedValue(undefined);

        const total = await productService.calculateProductPrice([{ id: 999, quantity: 1 }]);

        expect(total).toBeNull();
    });

    it('createCategory rejects duplicate category name', async () => {
        vi.mocked(cachedProductRepository.getCategoryByName).mockResolvedValue({
            id: 1,
            name: 'design',
            createdAt: 'x',
            updatedAt: 'x',
        });

        const result = await productService.createCategory({ name: 'design' });

        expect(result).toEqual({ error: 'Category with this name already exists' });
    });

    it('enrichProduct adds tools and toolIds', async () => {
        vi.mocked(cachedToolRepository.getToolsByProductId).mockResolvedValue([
            { id: 1, name: 'Tool A', createdAt: 'x', updatedAt: 'x' },
            { id: 2, name: 'Tool B', createdAt: 'x', updatedAt: 'x' },
        ]);

        const enriched = await productService.enrichProduct(makeProduct({ id: 10 }));

        expect(enriched.toolIds).toEqual([1, 2]);
        expect(enriched.tools).toHaveLength(2);
    });
});
