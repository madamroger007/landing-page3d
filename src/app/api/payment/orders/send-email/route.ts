import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/src/lib/auth/withAuth';
import { ordersRepository } from '@/src/server/repositories/orders';
import { ProgressPaymentEmail } from '@/src/server/services/email';
import { link } from 'fs';

export async function POST(req: NextRequest) {
    const auth = await requireSession(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = (await req.json()) as { order_id?: string };
        const orderId = (body.order_id || '').trim();

        if (!orderId) {
            return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
        }

        const order = await ordersRepository.getOrderByOrderId(orderId);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.transactionStatus !== 'settlement') {
            return NextResponse.json(
                { error: 'Email can only be sent for settlement orders' },
                { status: 400 }
            );
        }

        if (!order.customerEmail) {
            return NextResponse.json({ error: 'Order has no customer email' }, { status: 400 });
        }

        const { data, error } = await ProgressPaymentEmail({
            email: order.customerEmail,
            name: order.customerName || 'Customer',
            order_id: order.orderId,
            links: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/order/${order.orderId}` || "",
        });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to send progress email', detail: error },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('[orders-send-email]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
