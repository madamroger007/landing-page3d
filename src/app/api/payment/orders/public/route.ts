import { NextRequest, NextResponse } from 'next/server';
import { ordersRepository } from '@/src/server/repositories/orders';
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from '@/src/server/lib/rateLimit';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

const ORDER_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;

function parseItems(items: string | null): unknown[] {
    if (!items) return [];

    try {
        const parsed = JSON.parse(items) as unknown;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function toPublicCheckoutOrder(order: Awaited<ReturnType<typeof ordersRepository.getOrderByOrderId>>) {
    if (!order) return null;

    return {
        createdAt: order.createdAt.toISOString(),
        items: parseItems(order.items),
        order_id: order.orderId,
        status: order.transactionStatus || 'pending',
        product_link: order.productLink || undefined,
        gross_amount: order.grossAmount,
        snap_token: order.snapToken || undefined,
        customer: {
            name: order.customerName || '',
            email: order.customerEmail || '',
            phone: order.customerPhone || '',
        },
        payment_method: order.paymentType || undefined,
        payment_name: order.paymentName || undefined,
        payment_va: order.paymentVa || undefined,
        transaction_id: order.transactionId || undefined,
    };
}

/** GET /api/payment/orders/public?order_id=xxx — get one public checkout order */
export async function GET(req: NextRequest) {
    try {
        const ip = getRequestIp(req);
        const rateLimit = await checkRateLimit(`payment:orders-public-single:${ip}`, 60, 60);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: buildRateLimitHeaders(rateLimit) }
            );
        }

        const { searchParams } = new URL(req.url);
        const orderId = (searchParams.get('order_id') || '').trim();

        if (!orderId) {
            return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
        }

        if (!ORDER_ID_PATTERN.test(orderId)) {
            return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
        }

        const order = await ordersRepository.getOrderByOrderId(orderId);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order: toPublicCheckoutOrder(order) });
    } catch (err) {
        console.error('[orders-public-get]', err);
        await reportErrorToSlack(err, { source: 'orders-public-get', route: '/api/payment/orders/public', method: 'GET' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const ip = getRequestIp(req);
        const rateLimit = await checkRateLimit(`payment:orders-public:${ip}`, 60, 60);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: buildRateLimitHeaders(rateLimit) }
            );
        }

        const body = (await req.json()) as { order_ids?: string[] };
        const orderIds = Array.isArray(body.order_ids)
            ? body.order_ids
                .map((item) => (typeof item === 'string' ? item.trim() : ''))
                .filter(Boolean)
            : [];

        const uniqueOrderIds = Array.from(new Set(orderIds)).slice(0, 20);

        if (uniqueOrderIds.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        const orders = await ordersRepository.getOrdersByOrderIds(uniqueOrderIds);
        const normalized = orders.map((order) => ({
            orderId: order.orderId,
            orderLabel: order.orderLabel,
            productLink: order.productLink,
            transactionStatus: order.transactionStatus,
        }));

        return NextResponse.json({ orders: normalized });
    } catch (err) {
        console.error('[orders-public]', err);
        await reportErrorToSlack(err, { source: 'orders-public', route: '/api/payment/orders', method: 'POST' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
