'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import NavbarDashboard from '@/src/components/dashboard/NavbarDashboard';
import ImageUploader from '../../components/ImageUploader';
import { ProductFormData, ProductFormError } from '../../components/types';
import { createProductAction, updateProductAction } from '@/src/server/actions/products/action';
import { useProductContext } from '@/src/store/context/product/ProductContext';
import { formErrorStatement } from '@/src/utils/error';

const defaultFormData: ProductFormData = {
    name: '',
    price: 0,
    description: '',
    image: '',
    videoUrl: '',
    category: '',
    toolIds: [],
};

export default function ProductFormPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const isEdit = productId !== 'new';
    const {
        addProduct,
        updateProduct,
        categories,
        tools,
        products,
    } = useProductContext();
    const [loading, setLoading] = useState(isEdit);
    const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
    const [formError, setFormError] = useState<ProductFormError>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // ── Fetch product if editing ───────────────────────────────────────────
    useEffect(() => {
        if (isEdit) {
            const product = products.find((p) => p.id === Number(productId));
            if (product) {
                setFormData({
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    image: product.image || '',
                    videoUrl: product.videoUrl || '',
                    category: product.category || '',
                    toolIds: product.toolIds ?? product.tools?.map((tool) => tool.id) ?? [],
                });
                setLoading(false);
            }
        }
    }, [products, productId, isEdit]);

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
                toolIds: formData.toolIds,
                file: pendingFile,
                oldImageUrl: isEdit && pendingFile ? formData.image : null,
            };

            if (isEdit) {
                const response = await updateProductAction(Number(productId), body);
                formErrorStatement(response, setFormError);
                if (!response.success) return;

                updateProduct(response.product);
            } else {
                const response = await createProductAction(body);
                formErrorStatement(response, setFormError);
                if (!response.success) return;
                addProduct(response.product);
            }

            router.push('/dashboard/products');
        } catch {
            setFormError({
                formErrors: ['An unexpected error occurred'],
                fieldErrors: {},
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleToolChange = (toolId: number, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            toolIds: checked
                ? [...prev.toolIds, toolId]
                : prev.toolIds.filter((id) => id !== toolId),
        }));
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
            <NavbarDashboard menuTitle={isEdit ? 'Edit Product' : 'New Product'} />

            <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-gray-900 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-white mb-6">
                            {isEdit ? 'Edit Product' : 'Create New Product'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-100">
                                    Name
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

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-100">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    required
                                    min={0}
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formError?.fieldErrors.price ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {formError?.fieldErrors.price && (
                                    <p className="mt-1 text-xs text-red-500">{formError.fieldErrors.price[0]}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-100">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formError?.fieldErrors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {formError?.fieldErrors.description && (
                                    <p className="mt-1 text-xs text-red-500">{formError.fieldErrors.description[0]}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-100">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm "
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-100 mb-2">
                                    Product Image
                                </label>
                                <ImageUploader
                                    value={formData.image}
                                    onFileChange={setPendingFile}
                                    onRemove={() => {
                                        setFormData((prev) => ({ ...prev, image: '' }));
                                        setPendingFile(null);
                                    }}
                                    disabled={formLoading}
                                />
                                {formError?.fieldErrors.image && (
                                    <p className="mt-1 text-xs text-red-500">{formError.fieldErrors.image[0]}</p>
                                )}
                            </div>

                            {/* Tools */}
                            <div>
                                <label className="block text-sm font-medium text-gray-100 mb-2">
                                    Tools / Tech Used
                                </label>
                                <div className="grid grid-cols-2 gap-2 rounded-md border border-gray-700 p-3 bg-gray-800/50">
                                    {tools.length === 0 ? (
                                        <p className="text-sm text-gray-400 col-span-2">No tools available. Create tools first.</p>
                                    ) : (
                                        tools.map((tool) => (
                                            <label key={tool.id} className="flex items-center gap-2 text-sm text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.toolIds.includes(tool.id)}
                                                    onChange={(e) => handleToolChange(tool.id, e.target.checked)}
                                                    className="rounded border-gray-500"
                                                />
                                                <span>{tool.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {formError?.fieldErrors.toolIds && (
                                    <p className="mt-1 text-xs text-red-500">{formError.fieldErrors.toolIds[0]}</p>
                                )}
                            </div>

                            {/* Video URL */}
                            <div>
                                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-100">
                                    Video URL
                                </label>
                                <input
                                    type="url"
                                    id="videoUrl"
                                    name="videoUrl"
                                    value={formData.videoUrl}
                                    onChange={handleChange}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formError?.fieldErrors.videoUrl ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {formError?.fieldErrors.videoUrl && (
                                    <p className="mt-1 text-xs text-red-500">{formError.fieldErrors.videoUrl[0]}</p>
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
                                    onClick={() => router.push('/dashboard/products')}
                                    className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {formLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
