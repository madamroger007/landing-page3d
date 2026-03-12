import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/src/lib/auth/withAuth';
import { MidtransTransactionResponse } from '@/src/types/type';

const MIDTRANS_API_BASE = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';

/** GET /api/payment/transaction-status?order_id=xxx — requires session */
export async function GET(req: NextRequest) {
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

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        return NextResponse.json(
            { error: 'Midtrans server key not configured' },
            { status: 500 }
        );
    }

    try {
        const credentials = Buffer.from(`${serverKey}:`).toString('base64');

        const response = await fetch(
            `${MIDTRANS_API_BASE}/v2/${orderId}/status`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Basic ${credentials}`,
                },
            }
        );

        const data: MidtransTransactionResponse = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.status_message || 'Failed to fetch transaction status' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error('[transaction-status]', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/** POST /api/payment/transaction-status — get multiple transactions */
export async function POST(req: NextRequest) {
    const auth = await requireSession(req);
    if (auth instanceof NextResponse) return auth;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        return NextResponse.json(
            { error: 'Midtrans server key not configured' },
            { status: 500 }
        );
    }

    try {
        const { order_ids } = await req.json() as { order_ids: string[] };

        if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
            return NextResponse.json(
                { error: 'order_ids array is required' },
                { status: 400 }
            );
        }

        const credentials = Buffer.from(`${serverKey}:`).toString('base64');

        const results = await Promise.all(
            order_ids.map(async (orderId) => {
                try {
                    const response = await fetch(
                        `${MIDTRANS_API_BASE}/v2/${orderId}/status`,
                        {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Authorization': `Basic ${credentials}`,
                            },
                        }
                    );
                    return await response.json();
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
