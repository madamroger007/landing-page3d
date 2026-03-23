import { NextRequest, NextResponse } from 'next/server';
import { ordersRepository } from '@/src/server/repositories/orders';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { order_ids?: string[] };
        const orderIds = Array.isArray(body.order_ids)
            ? body.order_ids
                .map((item) => (typeof item === 'string' ? item.trim() : ''))
                .filter(Boolean)
            : [];

        if (orderIds.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        const orders = await ordersRepository.getOrdersByOrderIds(orderIds);
        const normalized = orders.map((order) => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : [],
        }));

        return NextResponse.json({ orders: normalized });
    } catch (err) {
        console.error('[orders-public]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
