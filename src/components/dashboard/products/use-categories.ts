'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Category,
    CategoryFormData,
    CategoryFormError,
    UseCategoriesReturn,
} from './types';
import {
    createCategory,
    updateCategory,
    deleteCategory as deleteCategoryAction,
    getCategories,
} from '@/src/server/actions/products/action';

const defaultFormData: CategoryFormData = {
    name: '',
};

export function useCategories(): UseCategoriesReturn {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
    const [formError, setFormError] = useState<CategoryFormError>(null);
    const [formLoading, setFormLoading] = useState(false);

    // ── Fetch data ─────────────────────────────────────────────────────────

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            if (data.success) {
                setCategories(data.categories);
            } else {
                setError(data.message || 'Failed to fetch categories');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // ── Form handlers ──────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError(null);
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name });
        } else {
            setEditingCategory(null);
            setFormData(defaultFormData);
        }
        setShowModal(true);
        setFormError(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            const data = editingCategory
                ? await updateCategory(editingCategory.id, formData)
                : await createCategory(formData);

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
            fetchCategories();
        } catch {
            setFormError({
                formErrors: ['An unexpected error occurred'],
                fieldErrors: {},
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (categoryId: number) => {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            const data = await deleteCategoryAction(categoryId);

            if (!data.success) {
                alert(data.message || 'Failed to delete category');
                return;
            }

            fetchCategories();
        } catch {
            alert('An unexpected error occurred');
        }
    };

    return {
        categories,
        loading,
        error,
        showModal,
        editingCategory,
        formData,
        formError,
        formLoading,
        handleChange,
        handleOpenModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
        refetch: fetchCategories,
    };
}
