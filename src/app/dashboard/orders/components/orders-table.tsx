import { Order } from '@/src/types/type';
import { OrderLabel } from './types';
import { OrderLabelBadge } from './order-label-badge';

type OrdersTableProps = {
    orders: Order[];
    totalItems: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    selectedOrder: Order | null;
    busyOrderId: string;
    onSelectOrder: (order: Order) => void;
    onChangeLabel: (orderId: string, label: OrderLabel) => Promise<void>;
    onSaveProductLink: (orderId: string, productLink: string) => Promise<void>;
    onOpenSendEmail: (order: Order) => void;
    onOpenDelete: (order: Order) => void;
    onPageChange: (page: number) => void;
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateString: string | Date | null) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function OrdersTable({
    orders,
    totalItems,
    pageSize,
    currentPage,
    totalPages,
    selectedOrder,
    busyOrderId,
    onSelectOrder,
    onChangeLabel,
    onSaveProductLink,
    onOpenSendEmail,
    onOpenDelete,
    onPageChange,
}: OrdersTableProps) {
    if (orders.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-gray-500">
                No settlement orders found for current filters.
            </div>
        );
    }

    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Settlement Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Link</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-50 divide-y divide-gray-200">
                        {orders.map((order) => {
                            const rowBusy = busyOrderId === order.orderId;
                            return (
                                <tr
                                    key={order.id}
                                    className={`hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => onSelectOrder(order)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900 font-mono">{order.orderId}</div>
                                        <div className="text-xs text-gray-500">{order.customerName || '-'} · {order.customerEmail || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(order.grossAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.settlementTime || order.updatedAt)}</td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <OrderLabelBadge label={order.orderLabel} />
                                            <select
                                                disabled={rowBusy}
                                                className="text-xs border border-gray-300 rounded px-2 py-1 text-black"
                                                value={(order.orderLabel || 'progress').toLowerCase()}
                                                onChange={(e) => onChangeLabel(order.orderId, e.target.value as OrderLabel)}
                                            >
                                                <option value="progress">progress</option>
                                                <option value="revisi">revisi</option>
                                                <option value="done">done</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <form
                                            className="flex items-center gap-2"
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                const form = e.currentTarget;
                                                const input = form.elements.namedItem('productLink') as HTMLInputElement | null;
                                                await onSaveProductLink(order.orderId, input?.value || '');
                                            }}
                                        >
                                            <input
                                                type="url"
                                                name="productLink"
                                                placeholder="https://..."
                                                disabled={rowBusy}
                                                defaultValue={order.productLink || ''}
                                                className="w-64 max-w-full text-xs border border-gray-300 rounded px-2 py-1 text-black"
                                            />
                                            <button
                                                type="submit"
                                                disabled={rowBusy}
                                                className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="inline-flex gap-2">
                                            <button
                                                type="button"
                                                disabled={rowBusy}
                                                onClick={() => onOpenSendEmail(order)}
                                                className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                Send Email
                                            </button>
                                            <button
                                                type="button"
                                                disabled={rowBusy}
                                                onClick={() => onOpenDelete(order)}
                                                className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-gray-500">
                    Showing {from}-{to} of {totalItems}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-xs text-gray-600">
                        Page {currentPage} / {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
