import { NextRequest, NextResponse } from 'next/server';
import { midtransProvider } from '@/src/server/providers/midtransProvider';
import { calculateEstimatedFee } from '@/src/server/lib/paymentFee';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

type FeeEstimateRequest = {
    subtotal: number;
    paymentMethod?: string;
    orderId?: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as FeeEstimateRequest;
        const subtotal = Number(body.subtotal || 0);

        if (!Number.isFinite(subtotal) || subtotal < 0) {
            return NextResponse.json({ error: 'subtotal must be a valid number' }, { status: 400 });
        }

        if (body.orderId) {
            try {
                const data = await midtransProvider.checkTransaction(body.orderId);
                const feeAmount = Number(data.fee_amount || 0);

                if (Number.isFinite(feeAmount) && feeAmount > 0) {
                    return NextResponse.json({
                        amount: feeAmount,
                        source: 'midtrans',
                    });
                }
            } catch (error) {
                console.error('[fee-estimate] Midtrans fee check failed:', error);
            }
        }

        const estimate = await calculateEstimatedFee(subtotal, body.paymentMethod);
        return NextResponse.json({
            amount: estimate.totalFee,
            source: 'fallback',
            message: `Estimated fee uses configured policy and includes VAT (${Math.round(estimate.vatRate * 100)}%).`,
        });
    } catch (error) {
        console.error('[fee-estimate]', error);
        await reportErrorToSlack(error, { source: 'fee-estimate', route: '/api/payment/fee-estimate', method: 'POST' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
