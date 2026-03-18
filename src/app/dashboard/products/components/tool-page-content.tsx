'use client';

import Link from 'next/link';
import NavbarDashboard from '@/src/components/dashboard/NavbarDashboard';
import LoadingSpinner from '@/src/components/loading/loadingSpinner';
import ErrorDisplay from '@/src/components/errors/errorDisplay';
import { useProductContext } from '@/src/store/context/product/ProductContext';
import { ToolTable } from './tool-table';

export default function ToolPageContent() {
    const { tools, loading, error, deleteTool } = useProductContext();

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;

    return (
        <div className="min-h-screen">
            <NavbarDashboard menuTitle="Tools" />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-gray-300">Product Tools</h2>
                        <Link
                            href="/dashboard/products/tools/form/new"
                            className="px-4 py-2 bg-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Add Tool
                        </Link>
                    </div>

                    <ToolTable tools={tools} onDelete={deleteTool} />
                </div>
            </main>
        </div>
    );
}
