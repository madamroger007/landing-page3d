import { NextRequest, NextResponse } from 'next/server';
import { requireApiToken } from '@/src/lib/auth/withAuth';
import { SendPaymentLinkEmail } from '@/src/server/services/email';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

/** POST /api/email/payment-link — requires Bearer token */
export async function POST(req: NextRequest) {
    const auth = await requireApiToken(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { email, name, order_id, total, items } = await req.json();
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment/${order_id}`;
        const body = { email, name, order_id, total, items, link };
        const { data, error } = await SendPaymentLinkEmail(body);

        if (error) {
            return NextResponse.json({ success: false, error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error in payment-link-email route:', error);
        await reportErrorToSlack(error, { source: 'payment-link-email', route: '/api/email/payment-link', method: 'POST' });
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}