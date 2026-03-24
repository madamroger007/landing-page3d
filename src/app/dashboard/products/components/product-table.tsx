'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/src/types/type';
import { useDashboardToast } from '@/src/components/dashboard/toast/DashboardToastProvider';
import {
    deleteProduct as deleteProductAction,
} from '@/src/server/actions/products/action';
interface ProductTableProps {
    products: Product[];
    onDelete: (productId: number) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
    const { showToast } = useDashboardToast();
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = products.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));


    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return products.slice(start, start + PAGE_SIZE);
    }, [products, currentPage]);

    const from = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const to = Math.min(currentPage * PAGE_SIZE, totalItems);

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
                onDelete(productId);
                showToast(data.message || 'Product deleted successfully', 'success', {
                    onClose: () => window.location.reload(),
                });
            }

        } catch {
            alert('An unexpected error occurred');
        }
    };
    return (
        <div className="bg-white/20 shadow overflow-x-auto sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200/20">
                <thead className="bg-gray-100/20">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                            Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                            Video Link
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                            Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                            Likes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                            Created At
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white/10 divide-y divide-gray-200/10">
                    {paginatedProducts.map((product) => (
                        <ProductRow
                            key={product.id}
                            product={product}
                            onDelete={handleDelete}
                        />
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-300">
                                No products found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="border-t border-gray-200/20 px-6 py-3 flex items-center justify-between">
                <p className="text-xs text-gray-300">Showing {from}-{to} of {totalItems}</p>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 text-xs rounded border border-gray-300/30 text-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-300">Page {currentPage} / {totalPages}</span>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1.5 text-xs rounded border border-gray-300/30 text-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Row Component ───────────────────────────────────────────────────────────

interface ProductRowProps {
    product: Product;
    onDelete: (id: number) => void;
}

function ProductRow({ product, onDelete }: ProductRowProps) {
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);

    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    {product.image && (
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-md object-cover mr-3"
                        />
                    )}
                    <span className="text-sm font-medium text-gray-300">{product.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-300">{formatPrice(product.price)}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Link href={product.videoUrl || ''} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-blue-300">
                    Link Video
                </Link>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-300">{product.category || '-'}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-300">{product.likes ?? 0}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-300">{formatDate(product.createdAt)}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <Link
                    href={`/dashboard/products/form/${product.id}`}
                    className="text-blue-100 hover:text-blue-300"
                >
                    Edit
                </Link>
                <button
                    onClick={() => onDelete(product.id)}
                    className="text-red-400 hover:text-red-500"
                >
                    Delete
                </button>
            </td>
        </tr>
    );
}
