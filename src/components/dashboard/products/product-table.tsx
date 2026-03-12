'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/src/types/type';

interface ProductTableProps {
    products: Product[];
    onDelete: (id: number) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
    return (
        <div className="bg-white/20 shadow overflow-hidden sm:rounded-lg">
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
                    {products.map((product) => (
                        <ProductRow
                            key={product.id}
                            product={product}
                            onDelete={onDelete}
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
