import { z } from 'zod';

// ─── Product Validation ──────────────────────────────────────────────────────

export const productSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name cannot exceed 100 characters'),

    price: z
        .number()
        .min(0, 'Price must be positive')
        .int('Price must be an integer'),

    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description cannot exceed 2000 characters'),

    image: z.string().url('Invalid image URL').optional().nullable(),

    videoUrl: z.string().url('Invalid video URL').optional().nullable(),

    category: z.string().optional().nullable(),

    toolIds: z.array(z.number().int().positive()).optional().default([]),
});

export const updateProductSchema = productSchema.partial();

export type ProductSchema = z.infer<typeof productSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;

// ─── Category Validation ─────────────────────────────────────────────────────

export const categorySchema = z.object({
    name: z
        .string()
        .min(2, 'Category name must be at least 2 characters')
        .max(50, 'Category name cannot exceed 50 characters'),
});

export type CategorySchema = z.infer<typeof categorySchema>;

// ─── Error Types ─────────────────────────────────────────────────────────────

export interface ZodErrorProductSchema {
    formErrors: string[];
    fieldErrors: {
        name?: string[];
        price?: string[];
        description?: string[];
        image?: string[];
        videoUrl?: string[];
        category?: string[];
        toolIds?: string[];
    };
}

export interface ZodErrorCategorySchema {
    formErrors: string[];
    fieldErrors: {
        name?: string[];
    };
}
