import { NextRequest, NextResponse } from 'next/server';
import { ordersRepository } from '@/src/server/repositories/orders';
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from '@/src/server/lib/rateLimit';

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
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
