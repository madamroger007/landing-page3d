import { describe, expect, it } from 'vitest';
import { categorySchema, productSchema, updateProductSchema } from '@/src/server/validations/products';

describe('products validation schema', () => {
    it('accepts valid product payload', () => {
        const result = productSchema.safeParse({
            name: 'Premium Product',
            price: 100000,
            description: 'This is a long enough product description',
            image: null,
            videoUrl: null,
            category: 'design',
            toolIds: [1, 2],
        });

        expect(result.success).toBe(true);
    });

    it('rejects non-integer product price', () => {
        const result = productSchema.safeParse({
            name: 'Product',
            price: 1000.5,
            description: 'This is a long enough product description',
        });

        expect(result.success).toBe(false);
    });

    it('accepts partial update payload', () => {
        const result = updateProductSchema.safeParse({
            name: 'New Name',
        });

        expect(result.success).toBe(true);
    });

    it('rejects too-short category name', () => {
        const result = categorySchema.safeParse({ name: 'A' });
        expect(result.success).toBe(false);
    });
});
