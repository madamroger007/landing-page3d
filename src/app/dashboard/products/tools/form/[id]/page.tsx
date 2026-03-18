'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import NavbarDashboard from '@/src/components/dashboard/NavbarDashboard';
import { ToolFormData, ToolFormError } from '../../../components/types';
import { createTool, updateTool } from '@/src/server/actions/products/action';
import { useProductContext } from '@/src/store/context/product/ProductContext';
import { formErrorStatement } from '@/src/utils/error';

const defaultFormData: ToolFormData = {
    name: '',
};

export default function ToolFormPage() {
    const router = useRouter();
    const params = useParams();
    const toolId = params.id as string;
    const isEdit = toolId !== 'new';

    const { tools, addTool, updateTool: updateToolContext } = useProductContext();

    const [loading, setLoading] = useState(isEdit);
    const [formData, setFormData] = useState<ToolFormData>(defaultFormData);
    const [formError, setFormError] = useState<ToolFormError>(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const tool = tools.find((item) => item.id === Number(toolId));
            if (tool) {
                setFormData({ name: tool.name });
                setLoading(false);
            }
        }
    }, [tools, toolId, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            if (isEdit) {
                const response = await updateTool(Number(toolId), formData);
                formErrorStatement(response, setFormError);
                if (!response.success) return;
                updateToolContext(response.tool);
            } else {
                const response = await createTool(formData);
                formErrorStatement(response, setFormError);
                if (!response.success) return;
                addTool(response.tool);
            }

            router.push('/dashboard/products/tools');
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
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <NavbarDashboard menuTitle={isEdit ? 'Edit Tool' : 'New Tool'} />

            <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-gray-900 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-white mb-6">{isEdit ? 'Edit Tool' : 'Create New Tool'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-100">
                                    Tool Name
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

                            {formError?.formErrors && formError.formErrors.length > 0 && (
                                <div className="p-3 bg-red-500/20 border border-red-500 rounded-md">
                                    {formError.formErrors.map((err, i) => (
                                        <p key={i} className="text-sm text-red-400">{err}</p>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/dashboard/products/tools')}
                                    className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-md hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {formLoading ? 'Saving...' : isEdit ? 'Update Tool' : 'Create Tool'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
