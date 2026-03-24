import { NextRequest, NextResponse } from 'next/server';
import { requireApiToken } from '@/src/lib/auth/withAuth';
import { SendConfirmationEmail } from '@/src/server/services/email';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

/** POST /api/email/send-confirmation — requires Bearer token */
export async function POST(req: NextRequest) {
    const auth = await requireApiToken(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { email, name, order_id, items, total } = await req.json();
        const body = { email, name, order_id, items, total };
        const { data, error } = await SendConfirmationEmail(body);
        if (error) {
            return NextResponse.json({ success: false, error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Send confirmation error:', error);
        await reportErrorToSlack(error, { source: 'send-confirmation', route: '/api/email/send-confirmation', method: 'POST' });
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
