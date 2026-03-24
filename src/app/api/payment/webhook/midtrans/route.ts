import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ordersRepository } from "@/src/server/repositories/orders";
import { extractPaymentPersistenceFields } from "@/src/utils/payment";
import { reportErrorToSlack } from "@/src/server/lib/slack-error-reporter";

function computeSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string) {
    return crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");
}

/** POST /api/payment/webhook/midtrans */
export async function POST(req: NextRequest) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        return NextResponse.json({ error: "Midtrans server key not configured" }, { status: 500 });
    }

    try {
        const body = (await req.json()) as Record<string, unknown>;
        const orderId = String(body.order_id || "");
        const statusCode = String(body.status_code || "");
        const grossAmount = String(body.gross_amount || "");
        const signatureKey = String(body.signature_key || "");

        if (!orderId || !statusCode || !grossAmount || !signatureKey) {
            return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
        }

        const expected = computeSignature(orderId, statusCode, grossAmount, serverKey);
        if (expected !== signatureKey) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const existingOrder = await ordersRepository.getOrderByOrderId(orderId);
        const paymentFields = extractPaymentPersistenceFields(body);

        await ordersRepository.updateFromMidtrans(orderId, {
            transaction_id: (body.transaction_id as string | undefined) || undefined,
            transaction_status: (body.transaction_status as string | undefined) || undefined,
            payment_type: (body.payment_type as string | undefined) || undefined,
            payment_name: existingOrder?.paymentName || paymentFields.payment_name || undefined,
            payment_va: existingOrder?.paymentVa || paymentFields.payment_va || undefined,
            fraud_status: (body.fraud_status as string | undefined) || undefined,
            transaction_time: (body.transaction_time as string | undefined) || undefined,
            settlement_time: (body.settlement_time as string | undefined) || undefined,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[midtrans-webhook]", error);
        await reportErrorToSlack(error, { source: 'midtrans-webhook', route: '/api/payment/webhook/midtrans', method: 'POST' });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
