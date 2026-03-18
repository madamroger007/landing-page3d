import { ZodErrorProductSchema, ZodErrorCategorySchema } from '@/src/server/validations/products';
import { ZodErrorToolSchema } from '@/src/server/validations/tools';

// ─── Product Types ───────────────────────────────────────────────────────────

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string | null;
    videoUrl: string | null;
    category: string | null;
    likes: number | null;
    createdAt: string;
}

export interface ProductFormData {
    name: string;
    price: number;
    description: string;
    image: string;
    videoUrl: string;
    category: string;
    toolIds: number[];
}

export type ProductFormError = ZodErrorProductSchema | null;

// ─── Category Types ──────────────────────────────────────────────────────────

export interface Category {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryFormData {
    name: string;
}

export type CategoryFormError = ZodErrorCategorySchema | null;

export interface ToolFormData {
    name: string;
}

export type ToolFormError = ZodErrorToolSchema | null;
