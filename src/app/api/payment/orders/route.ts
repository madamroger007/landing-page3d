import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/src/lib/auth/withAuth';
import { ordersRepository } from '@/src/server/repositories/orders';
import { MidtransTransactionResponse } from '@/src/types/type';
import { midtransProvider } from '@/src/server/providers/midtransProvider';
import { extractPaymentPersistenceFields } from '@/src/utils/payment';

/** GET /api/payment/orders — get all orders with optional Midtrans sync */
export async function GET(req: NextRequest) {
    const auth = await requireSession(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const sync = searchParams.get('sync') === 'true';
    const backfill = searchParams.get('backfill') === 'true';
    const status = searchParams.get('status');
    const label = searchParams.get('label');
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    try {
        let orders = status
            ? await ordersRepository.getOrdersByStatus(status, limit)
            : await ordersRepository.getAllOrders(limit);

        // Optionally sync with Midtrans to get latest status
        if (sync && orders.length > 0) {
            const candidateOrders = orders.filter(
                (order) =>
                    order.transactionStatus === 'pending' ||
                    !order.transactionStatus ||
                    (backfill && (!order.paymentName || !order.paymentVa))
            );

            await Promise.all(
                candidateOrders.slice(0, 10).map(async (order) => {
                    try {
                        const data = await midtransProvider.checkTransaction(order.orderId) as unknown as MidtransTransactionResponse;
                        const paymentFields = extractPaymentPersistenceFields(data as unknown as Record<string, unknown>);

                        await ordersRepository.updateFromMidtrans(order.orderId, {
                            transaction_id: data.transaction_id,
                            transaction_status: data.transaction_status,
                            payment_type: data.payment_type,
                            payment_name: order.paymentName || paymentFields.payment_name || undefined,
                            payment_va: order.paymentVa || paymentFields.payment_va || undefined,
                            fraud_status: data.fraud_status,
                            transaction_time: data.transaction_time,
                            settlement_time: data.settlement_time,
                        });
                    } catch (err) {
                        console.error(`[orders-sync] Failed to sync ${order.orderId}:`, err);
                    }
                })
            );

            // Refetch orders after sync
            orders = status
                ? await ordersRepository.getOrdersByStatus(status, limit)
                : await ordersRepository.getAllOrders(limit);
        }

        // Parse items JSON for each order
        let ordersWithItems = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : [],
        }));

        if (label) {
            ordersWithItems = ordersWithItems.filter(
                (order) => (order.orderLabel || 'progress').toLowerCase() === label.toLowerCase()
            );
        }

        if (query) {
            ordersWithItems = ordersWithItems.filter((order) => {
                const orderId = (order.orderId || '').toLowerCase();
                const customerName = (order.customerName || '').toLowerCase();
                const customerEmail = (order.customerEmail || '').toLowerCase();
                return (
                    orderId.includes(query) ||
                    customerName.includes(query) ||
                    customerEmail.includes(query)
                );
            });
        }

        return NextResponse.json({ orders: ordersWithItems });
    } catch (err) {
        console.error('[orders]', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/** PATCH /api/payment/orders?order_id=xxx — update order workflow fields */
export async function PATCH(req: NextRequest) {
    const auth = await requireSession(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
        return NextResponse.json(
            { error: 'order_id is required' },
            { status: 400 }
        );
    }

    try {
        const body = await req.json();
        const nextWorkflow: { orderLabel?: string; productLink?: string | null } = {};

        if (typeof body.orderLabel === 'string') {
            const orderLabel = body.orderLabel.trim().toLowerCase();
            const allowedLabels = new Set(['progress', 'revisi', 'done']);

            if (!allowedLabels.has(orderLabel)) {
                return NextResponse.json(
                    { error: 'orderLabel must be one of: progress, revisi, done' },
                    { status: 400 }
                );
            }

            nextWorkflow.orderLabel = orderLabel;
        }

        if (Object.prototype.hasOwnProperty.call(body, 'productLink')) {
            const productLinkRaw = typeof body.productLink === 'string' ? body.productLink.trim() : '';

            if (!productLinkRaw) {
                nextWorkflow.productLink = null;
            } else {
                try {
                    const parsed = new URL(productLinkRaw);
                    if (!['http:', 'https:'].includes(parsed.protocol)) {
                        throw new Error('Invalid protocol');
                    }
                    nextWorkflow.productLink = productLinkRaw;
                } catch {
                    return NextResponse.json(
                        { error: 'productLink must be a valid http/https URL or empty string' },
                        { status: 400 }
                    );
                }
            }
        }

        if (Object.keys(nextWorkflow).length === 0) {
            return NextResponse.json(
                { error: 'No updatable fields provided. Use orderLabel and/or productLink' },
                { status: 400 }
            );
        }

        const updated = await ordersRepository.updateOrderWorkflow(orderId, nextWorkflow);

        if (!updated) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, order: updated });
    } catch (err) {
        console.error('[orders-patch]', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/** DELETE /api/payment/orders?order_id=xxx — delete an order */
export async function DELETE(req: NextRequest) {
    const auth = await requireSession(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
        return NextResponse.json(
            { error: 'order_id is required' },
            { status: 400 }
        );
    }

    try {
        const deleted = await ordersRepository.deleteOrder(orderId);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[orders-delete]', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
