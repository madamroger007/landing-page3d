'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import NavbarDashboard from '@/src/components/dashboard/NavbarDashboard';
import { CategoryFormData, CategoryFormError } from '../../../components/types';
import { createCategory, updateCategory as updateCategoryAction } from '@/src/server/actions/products/action';
import { useProductContext } from '@/src/store/context/product/ProductContext';
import { formErrorStatement } from '@/src/utils/error';

const defaultFormData: CategoryFormData = {
    name: '',
};

export default function CategoryFormPage() {
    const router = useRouter();
    const params = useParams();
    const categoryId = params.id as string;
    const isEdit = categoryId !== 'new';
    const {
        addCategory,
        updateCategory,
        categories,
    } = useProductContext();
    const [loading, setLoading] = useState(isEdit);
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
    const [formError, setFormError] = useState<CategoryFormError>(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const category = categories.find((cat) => cat.id === Number(categoryId));
            if (category) {
                setFormData({
                    name: category.name,
                });

                setLoading(false);
            }
        }
    }, [categories, categoryId, isEdit]);

    // ── Form handlers ──────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            const body = {
                ...formData,

            };

            if (isEdit) {
                const response = await updateCategoryAction(Number(categoryId), body);
                formErrorStatement(response, setFormError);
                if (!response.success) return;

                updateCategory(response.category);
            } else {
                const response = await createCategory(body);
                formErrorStatement(response, setFormError);
                if (!response.success) return;
                addCategory(response.category);
            }

            router.push('/dashboard/products/categories');
        } catch {
            setFormError({
                formErrors: ['An unexpected error occurred'],
                fieldErrors: {},
            });
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <svg
                    className="animate-spin h-10 w-10 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <NavbarDashboard menuTitle={isEdit ? 'Edit Category' : 'New Category'} />

            <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-gray-900 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-white mb-6">
                            {isEdit ? 'Edit Category' : 'Create New Category'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-100">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formError?.fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {formError?.fieldErrors.name && (
                                    <p className="mt-1 text-xs text-red-500">{formError.fieldErrors.name[0]}</p>
                                )}
                            </div>

                            {/* Form Errors */}
                            {formError?.formErrors && formError.formErrors.length > 0 && (
                                <div className="p-3 bg-red-500/20 border border-red-500 rounded-md">
                                    {formError.formErrors.map((err, i) => (
                                        <p key={i} className="text-sm text-red-400">{err}</p>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/dashboard/products/categories')}
                                    className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {formLoading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
