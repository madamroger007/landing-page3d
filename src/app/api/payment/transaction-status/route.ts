import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/src/lib/auth/withAuth';
import { midtransProvider } from '@/src/server/providers/midtransProvider';
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from '@/src/server/lib/rateLimit';

const ORDER_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;

/** GET /api/payment/transaction-status?order_id=xxx — public checkout status check */
export async function GET(req: NextRequest) {
    const ip = getRequestIp(req);
    const rateLimit = await checkRateLimit(`payment:transaction-status:${ip}`, 30, 60);

    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: buildRateLimitHeaders(rateLimit) }
        );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
        return NextResponse.json(
            { error: 'order_id is required' },
            { status: 400 }
        );
    }

    if (!ORDER_ID_PATTERN.test(orderId)) {
        return NextResponse.json(
            { error: 'Invalid order_id format' },
            { status: 400 }
        );
    }

    try {
        const data = await midtransProvider.checkTransaction(orderId);

        return NextResponse.json(data);
    } catch (err) {
        console.error('[transaction-status]', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

/** POST /api/payment/transaction-status — get multiple transactions */
export async function POST(req: NextRequest) {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    try {
        const { order_ids } = await req.json() as { order_ids: string[] };

        if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
            return NextResponse.json(
                { error: 'order_ids array is required' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            order_ids.map(async (orderId) => {
                try {
                    return await midtransProvider.checkTransaction(orderId);
                } catch {
                    return { order_id: orderId, error: 'Failed to fetch' };
                }
            })
        );

        return NextResponse.json({ transactions: results });
    } catch (err) {
        console.error('[transaction-status-batch]', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
