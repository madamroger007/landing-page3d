'use client';

import NavbarDashboard from '@/src/components/dashboard/NavbarDashboard';
import ErrorDisplay from '@/src/components/errors/errorDisplay';
import LoadingSpinner from '@/src/components/loading/loadingSpinner';
import { DeleteOrderModal } from './delete-order-modal';
import { OrdersFilterBar } from './orders-filter-bar';
import { OrdersTable } from './orders-table';
import { SendEmailModal } from './send-email-modal';
import { useManageOrders } from './use-manage-orders';
import { formatCurrency, formatDate } from '@/src/utils/format';


export function ManageOrdersPageContent() {
    const {
        paginatedOrders,
        loading,
        error,
        stats,
        totalItems,
        totalPages,
        currentPage,
        pageSize,
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
    } = useManageOrders();

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;

    return (
        <div className="min-h-screen">
            <NavbarDashboard menuTitle="Manage Orders" />

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-200">Settlement Orders</h1>
                        <p className="text-sm text-gray-400">Data source: invoice settlements only.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchOrders()}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-xl font-bold text-gray-100">{stats.total}</p>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Progress</p>
                        <p className="text-xl font-bold text-yellow-300">{stats.progress}</p>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Revisi</p>
                        <p className="text-xl font-bold text-orange-300">{stats.revisi}</p>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Done</p>
                        <p className="text-xl font-bold text-green-300">{stats.done}</p>
                    </div>
                </div>

                <OrdersFilterBar filters={filters} onChange={setFilters} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <OrdersTable
                            orders={paginatedOrders}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            selectedOrder={selectedOrder}
                            busyOrderId={busyOrderId}
                            onSelectOrder={setSelectedOrder}
                            onChangeLabel={updateOrderLabel}
                            onSaveProductLink={updateOrderProductLink}
                            onOpenSendEmail={setSendEmailOrder}
                            onOpenDelete={setDeleteOrderTarget}
                            onPageChange={setCurrentPage}
                        />
                    </div>

                    <div className="bg-white shadow rounded-lg p-4 h-fit sticky top-6">
                        <h3 className="text-sm font-semibold text-gray-800">Order Detail</h3>
                        {!selectedOrder && <p className="text-sm text-gray-500 mt-3">Select one order to see detail.</p>}
                        {selectedOrder && (
                            <div className="mt-3 space-y-2 text-sm text-gray-700">
                                <div><span className="font-semibold">Order ID:</span> <span className="font-mono">{selectedOrder.orderId}</span></div>
                                <div><span className="font-semibold">Customer:</span> {selectedOrder.customerName || '-'}</div>
                                <div><span className="font-semibold">Email:</span> {selectedOrder.customerEmail || '-'}</div>
                                <div><span className="font-semibold">Item:</span> {selectedOrder.items?.map((item) => item.name).join(', ') || '-'}</div>

                                <div><span className="font-semibold">Amount:</span> {formatCurrency(selectedOrder.grossAmount)}</div>
                                <div><span className="font-semibold">Transaction:</span> {(selectedOrder.transactionStatus || '-').toUpperCase()}</div>
                                <div><span className="font-semibold">Label:</span> {(selectedOrder.orderLabel || 'progress').toUpperCase()}</div>
                                <div>
                                    <span className="font-semibold">Product Link:</span>{' '}
                                    {selectedOrder.productLink ? (
                                        <a
                                            href={selectedOrder.productLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                        >
                                            {selectedOrder.productLink}
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </div>
                                <div><span className="font-semibold">Settlement:</span> {formatDate(selectedOrder.settlementTime || selectedOrder.updatedAt)}</div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <SendEmailModal
                order={sendEmailOrder}
                busy={Boolean(sendEmailOrder && busyOrderId === sendEmailOrder.orderId)}
                onClose={() => setSendEmailOrder(null)}
                onConfirm={confirmSendEmail}
            />

            <DeleteOrderModal
                order={deleteOrderTarget}
                busy={Boolean(deleteOrderTarget && busyOrderId === deleteOrderTarget.orderId)}
                onClose={() => setDeleteOrderTarget(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
