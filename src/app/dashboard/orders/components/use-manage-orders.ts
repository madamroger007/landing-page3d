'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Order } from '@/src/types/type';
import { ManageOrderFilters, OrderLabel, OrderApiResponse, UpdateWorkflowInput } from './types';
import { useDashboardToast } from '@/src/components/dashboard/toast/DashboardToastProvider';

export function useManageOrders() {
    const { showToast } = useDashboardToast();
    const PAGE_SIZE = 10;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filters, setFilters] = useState<ManageOrderFilters>({ q: '', label: '' });

    const [sendEmailOrder, setSendEmailOrder] = useState<Order | null>(null);
    const [deleteOrderTarget, setDeleteOrderTarget] = useState<Order | null>(null);
    const [busyOrderId, setBusyOrderId] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();
            params.set('status', 'settlement');
            params.set('sync', 'false');
            params.set('limit', '200');
            if (filters.label) params.set('label', filters.label);
            if (filters.q.trim()) params.set('q', filters.q.trim());

            const response = await fetch(`/api/payment/orders?${params.toString()}`);
            const data = (await response.json()) as OrderApiResponse & { error?: string };

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch orders');
            }

            setOrders(data.orders || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [filters.label, filters.q]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters.label, filters.q]);

    const updateOrderWorkflow = useCallback(async (orderId: string, payload: UpdateWorkflowInput) => {
        setBusyOrderId(orderId);
        try {
            const response = await fetch(`/api/payment/orders?order_id=${encodeURIComponent(orderId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = (await response.json()) as { success?: boolean; order?: Order; error?: string };
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to update order workflow');
            }

            setOrders((prev) =>
                prev.map((order) => {
                    if (order.orderId !== orderId) return order;

                    return {
                        ...order,
                        orderLabel: payload.orderLabel ?? order.orderLabel,
                        productLink:
                            payload.productLink !== undefined
                                ? payload.productLink.trim() || null
                                : order.productLink,
                    };
                })
            );

            setSelectedOrder((prev) =>
                prev && prev.orderId === orderId
                    ? {
                        ...prev,
                        orderLabel: payload.orderLabel ?? prev.orderLabel,
                        productLink:
                            payload.productLink !== undefined
                                ? payload.productLink.trim() || null
                                : prev.productLink,
                    }
                    : prev
            );
        } finally {
            setBusyOrderId('');
        }
    }, []);

    const updateOrderLabel = useCallback(async (orderId: string, nextLabel: OrderLabel) => {
        await updateOrderWorkflow(orderId, { orderLabel: nextLabel });
    }, [updateOrderWorkflow]);

    const updateOrderProductLink = useCallback(async (orderId: string, productLink: string) => {
        await updateOrderWorkflow(orderId, { productLink });
    }, [updateOrderWorkflow]);

    const confirmSendEmail = useCallback(async () => {
        if (!sendEmailOrder) return;

        setBusyOrderId(sendEmailOrder.orderId);
        try {
            const response = await fetch('/api/payment/orders/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: sendEmailOrder.orderId }),
            });

            const data = (await response.json()) as { success?: boolean; error?: string };
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to send email');
            }

            setSendEmailOrder(null);
            showToast('Confirmation email sent successfully');
        } finally {
            setBusyOrderId('');
        }
    }, [sendEmailOrder, showToast]);

    const confirmDelete = useCallback(async () => {
        if (!deleteOrderTarget) return;

        setBusyOrderId(deleteOrderTarget.orderId);
        try {
            const response = await fetch(
                `/api/payment/orders?order_id=${encodeURIComponent(deleteOrderTarget.orderId)}`,
                { method: 'DELETE' }
            );

            const data = (await response.json()) as { success?: boolean; error?: string };
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to delete order');
            }

            setOrders((prev) => prev.filter((order) => order.orderId !== deleteOrderTarget.orderId));
            setSelectedOrder((prev) =>
                prev?.orderId === deleteOrderTarget.orderId ? null : prev
            );
            setDeleteOrderTarget(null);
            showToast('Order deleted successfully', 'success', {
                onClose: () => window.location.reload(),
            });
        } finally {
            setBusyOrderId('');
        }
    }, [deleteOrderTarget, showToast]);

    const stats = useMemo(() => {
        const progress = orders.filter((order) => (order.orderLabel || 'progress') === 'progress').length;
        const revisi = orders.filter((order) => (order.orderLabel || 'progress') === 'revisi').length;
        const done = orders.filter((order) => (order.orderLabel || 'progress') === 'done').length;

        return { total: orders.length, progress, revisi, done };
    }, [orders]);

    const totalItems = orders.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return orders.slice(start, end);
    }, [orders, currentPage, PAGE_SIZE]);

    return {
        orders,
        paginatedOrders,
        loading,
        error,
        stats,
        totalItems,
        totalPages,
        currentPage,
        pageSize: PAGE_SIZE,
        selectedOrder,
        setSelectedOrder,
        filters,
        setFilters,
        busyOrderId,

        sendEmailOrder,
        setSendEmailOrder,
        deleteOrderTarget,
        setDeleteOrderTarget,

        fetchOrders,
        updateOrderLabel,
        updateOrderProductLink,
        confirmSendEmail,
        confirmDelete,
        setCurrentPage,
    };
}
