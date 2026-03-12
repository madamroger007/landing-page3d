'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Category,
    ProductFormData,
    ProductFormError,
    UseProductsReturn,
} from './types';
import {
    createProductAction,
    updateProductAction,
    deleteProduct as deleteProductAction,
} from '@/src/server/actions/products/action';
import { Product } from '@/src/types/type';
import { useProductContext } from '@/src/store/context/product/ProductContext';

const defaultFormData: ProductFormData = {
    name: '',
    price: 0,
    description: '',
    image: '',
    videoUrl: '',
    category: '',
};

export function useProducts(): UseProductsReturn {

    const [categories, setCategories] = useState<Category[]>([]);
    const {
        deleteProduct
    } = useProductContext();
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
    const [formError, setFormError] = useState<ProductFormError>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch('/api/products/categories');
            const data = await response.json();

            if (data.success) {
                setCategories(data.categories);
            }
        } catch {
            // Silent fail for categories
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // ── Form handlers ──────────────────────────────────────────────────────

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
        setFormError(null);
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                description: product.description,
                image: product.image || '',
                videoUrl: product.videoUrl || '',
                category: product.category || '',
            });
        } else {
            setEditingProduct(null);
            setFormData(defaultFormData);
        }
        setShowModal(true);
        setFormError(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            const body = {
                ...formData,
                image: formData.image || null,
                videoUrl: formData.videoUrl || null,
                category: formData.category || null,
            };

            const data = editingProduct
                ? await updateProductAction(editingProduct.id, body)
                : await createProductAction(body);

            if (!data.success) {
                if (data.errors) {
                    setFormError(data.errors);
                } else {
                    setFormError({
                        formErrors: [data.message || 'Operation failed'],
                        fieldErrors: {},
                    });
                }
                return;
            }

            handleCloseModal();
        } catch {
            setFormError({
                formErrors: ['An unexpected error occurred'],
                fieldErrors: {},
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const data = await deleteProductAction(productId);

            if (!data.success) {
                alert(data.message || 'Failed to delete product');
                return;
            } else {
                alert(data.message || 'Product deleted successfully');
                deleteProduct(productId);
                console.log(`Product with ID ${productId} deleted successfully`);
            }

        } catch {
            alert('An unexpected error occurred');
        }
    };

    return {
        categories,
        showModal,
        editingProduct,
        formData,
        formError,
        formLoading,
        handleChange,
        handleOpenModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    };
}
