'use client';

import Link from 'next/link';
import { deleteTool as deleteToolAction } from '@/src/server/actions/products/action';
import { ProductTool } from '@/src/types/type';

interface ToolTableProps {
    tools: ProductTool[];
    onDelete: (id: number) => void;
}

export function ToolTable({ tools, onDelete }: ToolTableProps) {
    const handleDelete = async (toolId: number) => {
        if (!confirm('Are you sure you want to delete this tool?')) {
            return;
        }

        try {
            const data = await deleteToolAction(toolId);
            if (!data.success) {
                alert(data.message || 'Failed to delete tool');
                return;
            }

            alert(data.message || 'Tool deleted successfully');
            onDelete(toolId);
        } catch {
            alert('An unexpected error occurred');
        }
    };

    return (
        <div className="bg-white/20 shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200/20">
                <thead className="bg-gray-100/20">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Updated At</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white/10 divide-y divide-gray-200/10">
                    {tools.map((tool) => (
                        <ToolRow key={tool.id} tool={tool} onDelete={handleDelete} />
                    ))}
                    {tools.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-300">
                                No tools found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

interface ToolRowProps {
    tool: ProductTool;
    onDelete: (id: number) => void;
}

function ToolRow({ tool, onDelete }: ToolRowProps) {
    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-300">{tool.name}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-300">{formatDate(tool.createdAt)}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-300">{formatDate(tool.updatedAt)}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <Link href={`/dashboard/products/tools/form/${tool.id}`} className="text-blue-100 hover:text-blue-300">
                    Edit
                </Link>
                <button onClick={() => onDelete(tool.id)} className="text-red-400 hover:text-red-500">
                    Delete
                </button>
            </td>
        </tr>
    );
}
