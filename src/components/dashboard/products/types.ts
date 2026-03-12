import { ZodErrorProductSchema, ZodErrorCategorySchema } from '@/src/server/validations/products';
import { Product } from '@/src/types/type';

// ─── Product Types ───────────────────────────────────────────────────────────


export interface ProductFormData {
    name: string;
    price: number;
    description: string;
    image: string;
    videoUrl: string;
    category: string;
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

// ─── Hook Return Types ───────────────────────────────────────────────────────

export interface UseProductsReturn {
    // Data
    categories: Category[];


    // Modal state
    showModal: boolean;
    editingProduct: Product | null;
    formData: ProductFormData;
    formError: ProductFormError;
    formLoading: boolean;

    // Handlers
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleOpenModal: (product?: Product) => void;
    handleCloseModal: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
}

export interface UseCategoriesReturn {
    // Data
    categories: Category[];
    loading: boolean;
    error: string;

    // Modal state
    showModal: boolean;
    editingCategory: Category | null;
    formData: CategoryFormData;
    formError: CategoryFormError;
    formLoading: boolean;

    // Handlers
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleOpenModal: (category?: Category) => void;
    handleCloseModal: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
    refetch: () => Promise<void>;
}
