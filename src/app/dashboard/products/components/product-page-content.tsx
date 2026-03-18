'use client';

import Link from 'next/link';
import NavbarDashboard from '@/src/components/dashboard/NavbarDashboard';
import { ProductTable } from './product-table';
import { useProductContext } from '@/src/store/context/product/ProductContext';
import LoadingSpinner from '@/src/components/loading/loadingSpinner';
import ErrorDisplay from '@/src/components/errors/errorDisplay';

export default function ProductPageContent() {
    const { products, loading, error, deleteProduct } = useProductContext();

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;

    return (
        <div className="min-h-screen">
            <NavbarDashboard menuTitle="Products" />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-gray-300">Products</h2>
                        <div className="space-x-2">
                            <Link
                                href="/dashboard/products/categories"
                                className="px-4 py-2 bg-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go To Category
                            </Link>
                            <Link
                                href="/dashboard/products/tools"
                                className="px-4 py-2 bg-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go To Tools
                            </Link>
                            <Link
                                href="/dashboard/products/form/new"
                                className="px-4 py-2 bg-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Add Product
                            </Link>
                        </div>
                    </div>

                    <ProductTable
                        products={products}
                        onDelete={deleteProduct}
                    />
                </div>
            </main>
        </div>
    );
}