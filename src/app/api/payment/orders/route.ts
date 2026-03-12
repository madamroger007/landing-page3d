import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/src/lib/auth/withAuth';
import { ordersRepository } from '@/src/server/repositories/orders';
import { MidtransTransactionResponse } from '@/src/types/type';

const MIDTRANS_API_BASE = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';

/** GET /api/payment/orders — get all orders with optional Midtrans sync */
export async function GET(req: NextRequest) {
    const auth = await requireSession(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const sync = searchParams.get('sync') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    try {
        let orders = await ordersRepository.getAllOrders(limit);

        // Optionally sync with Midtrans to get latest status
        if (sync && orders.length > 0) {
            const serverKey = process.env.MIDTRANS_SERVER_KEY;
            if (serverKey) {
                const credentials = Buffer.from(`${serverKey}:`).toString('base64');

                // Sync status for orders that are still pending
                const pendingOrders = orders.filter(
                    o => o.transactionStatus === 'pending' || !o.transactionStatus
                );

                await Promise.all(
                    pendingOrders.slice(0, 10).map(async (order) => {
                        try {
                            const response = await fetch(
                                `${MIDTRANS_API_BASE}/v2/${order.orderId}/status`,
                                {
                                    method: 'GET',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Authorization': `Basic ${credentials}`,
                                    },
                                }
                            );

                            if (response.ok) {
                                const data: MidtransTransactionResponse = await response.json();
                                await ordersRepository.updateFromMidtrans(order.orderId, {
                                    transaction_id: data.transaction_id,
                                    transaction_status: data.transaction_status,
                                    payment_type: data.payment_type,
                                    fraud_status: data.fraud_status,
                                    transaction_time: data.transaction_time,
                                    settlement_time: data.settlement_time,
                                });
                            }
                        } catch (err) {
                            console.error(`[orders-sync] Failed to sync ${order.orderId}:`, err);
                        }
                    })
                );

                // Refetch orders after sync
                orders = await ordersRepository.getAllOrders(limit);
            }
        }

        // Parse items JSON for each order
        const ordersWithItems = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : [],
        }));

        return NextResponse.json({ orders: ordersWithItems });
    } catch (err) {
        console.error('[orders]', err);
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
