'use client';

import { useState, useEffect, useCallback } from 'react';
import NavbarDashboard from '@/src/components/dashboard/NavbarDashboard';
import { Item } from '@/src/types/type';

type TransactionStatusBadge = {
    [key: string]: { bg: string; text: string };
};

const statusColors: TransactionStatusBadge = {
    settlement: { bg: 'bg-green-100', text: 'text-green-800' },
    capture: { bg: 'bg-green-100', text: 'text-green-800' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    deny: { bg: 'bg-red-100', text: 'text-red-800' },
    cancel: { bg: 'bg-gray-100', text: 'text-gray-800' },
    expire: { bg: 'bg-orange-100', text: 'text-orange-800' },
    failure: { bg: 'bg-red-100', text: 'text-red-800' },
    refund: { bg: 'bg-purple-100', text: 'text-purple-800' },
    partial_refund: { bg: 'bg-purple-100', text: 'text-purple-800' },
    authorize: { bg: 'bg-blue-100', text: 'text-blue-800' },
};

interface Order {
    id: number;
    orderId: string;
    grossAmount: number;
    snapToken: string | null;
    paymentType: string | null;
    transactionStatus: string | null;
    transactionId: string | null;
    fraudStatus: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    items: Item[];
    createdAt: string;
    updatedAt: string;
    transactionTime: string | null;
    settlementTime: string | null;
}

export default function InvoicePage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async (sync: boolean = false) => {
        if (sync) {
            setSyncing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await fetch(`/api/payment/orders?sync=${sync}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to fetch orders');
                return;
            }

            setOrders(data.orders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const getStatusBadge = (status: string | null) => {
        const statusKey = status || 'pending';
        const colors = statusColors[statusKey] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {statusKey.toUpperCase()}
            </span>
        );
    };

    const handleDelete = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            const response = await fetch(`/api/payment/orders?order_id=${encodeURIComponent(orderId)}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setOrders(orders.filter(o => o.orderId !== orderId));
                if (selectedOrder?.orderId === orderId) {
                    setSelectedOrder(null);
                }
            }
        } catch (err) {
            console.error('Error deleting order:', err);
        }
    };

    return (
        <div className="min-h-screen">
            <NavbarDashboard menuTitle="Invoice / Transactions" />

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                All Transactions (Midtrans Sandbox)
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {orders.length} order(s) found
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchOrders(true)}
                                disabled={syncing}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {syncing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Sync with Midtrans
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => fetchOrders()}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Orders List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="p-8 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No transactions yet</p>
                                    <p className="text-xs text-gray-400">Create a transaction to see it here</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className={`hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 font-mono">
                                                            {order.orderId}
                                                        </div>
                                                        {order.customerName && (
                                                            <div className="text-sm text-gray-500">
                                                                {order.customerName}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {formatCurrency(order.grossAmount)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(order.transactionStatus)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(order.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(order.orderId);
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Details Sidebar */}
                    <div className="lg:col-span-1">
                        {selectedOrder ? (
                            <div className="bg-white shadow rounded-lg overflow-hidden sticky top-6">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">Details</h3>
                                        <button
                                            onClick={() => setSelectedOrder(null)}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="px-6 py-4 space-y-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase">Order ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedOrder.orderId}</dd>
                                    </div>
                                    {selectedOrder.transactionId && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 uppercase">Transaction ID</dt>
                                            <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedOrder.transactionId}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase">Amount</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(selectedOrder.grossAmount)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
                                        <dd className="mt-1">{getStatusBadge(selectedOrder.transactionStatus)}</dd>
                                    </div>
                                    {selectedOrder.paymentType && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 uppercase">Payment Type</dt>
                                            <dd className="mt-1 text-sm text-gray-900 capitalize">{selectedOrder.paymentType.replace(/_/g, ' ')}</dd>
                                        </div>
                                    )}
                                    {selectedOrder.fraudStatus && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 uppercase">Fraud Status</dt>
                                            <dd className="mt-1 text-sm text-gray-900 capitalize">{selectedOrder.fraudStatus}</dd>
                                        </div>
                                    )}

                                    {/* Customer Info */}
                                    {(selectedOrder.customerName || selectedOrder.customerEmail) && (
                                        <div className="border-t pt-4">
                                            <dt className="text-xs font-medium text-gray-500 uppercase mb-2">Customer</dt>
                                            {selectedOrder.customerName && (
                                                <dd className="text-sm text-gray-900">{selectedOrder.customerName}</dd>
                                            )}
                                            {selectedOrder.customerEmail && (
                                                <dd className="text-sm text-gray-500">{selectedOrder.customerEmail}</dd>
                                            )}
                                            {selectedOrder.customerPhone && (
                                                <dd className="text-sm text-gray-500">{selectedOrder.customerPhone}</dd>
                                            )}
                                        </div>
                                    )}

                                    {/* Items */}
                                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                                        <div className="border-t pt-4">
                                            <dt className="text-xs font-medium text-gray-500 uppercase mb-2">Items</dt>
                                            <dd className="space-y-2">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-gray-900">{item.name} x{item.quantity}</span>
                                                        <span className="text-gray-500">{formatCurrency(item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </dd>
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    <div className="border-t pt-4">
                                        <dt className="text-xs font-medium text-gray-500 uppercase mb-2">Timestamps</dt>
                                        <dd className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created</span>
                                                <span className="text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                                            </div>
                                            {selectedOrder.transactionTime && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Transaction</span>
                                                    <span className="text-gray-900">{formatDate(selectedOrder.transactionTime)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.settlementTime && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Settlement</span>
                                                    <span className="text-gray-900">{formatDate(selectedOrder.settlementTime)}</span>
                                                </div>
                                            )}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white shadow rounded-lg p-6 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">Select an order to view details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Info</h4>
                    <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>Orders are stored locally when created via checkout</li>
                        <li>Click &quot;Sync with Midtrans&quot; to update pending order statuses</li>
                        <li>Status: <code className="bg-blue-100 px-1 rounded">settlement</code> = paid, <code className="bg-blue-100 px-1 rounded">pending</code> = awaiting payment</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
