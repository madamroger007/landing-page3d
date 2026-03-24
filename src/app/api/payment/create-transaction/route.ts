import { NextRequest, NextResponse } from "next/server";
import { MidtransTransaction } from "@/src/types/type";
import { createPaymentService, createPaymentWithCoreApi } from "@/src/server/services/payment";
import { ordersRepository } from "@/src/server/repositories/orders";
import { buildRateLimitHeaders, checkRateLimit, getRequestIp } from "@/src/server/lib/rateLimit";
import { reportErrorToSlack } from "@/src/server/lib/slack-error-reporter";

const ORDER_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;

function resolvePersistedGrossAmount(
    requestedGrossAmount: number,
    paymentData: Record<string, unknown>
) {
    const rawSnapResult = paymentData.raw_snap_result as Record<string, unknown> | undefined;
    const midtransGrossAmount = Number(rawSnapResult?.gross_amount ?? NaN);

    if (Number.isFinite(midtransGrossAmount) && midtransGrossAmount > 0) {
        return midtransGrossAmount;
    }

    return Math.round(requestedGrossAmount);
}

/** POST /api/payment/create-transaction — Core API charge flow */
export async function POST(req: NextRequest) {
    try {
        const ip = getRequestIp(req);
        const rateLimit = await checkRateLimit(`payment:create-transaction:${ip}`, 20, 60);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: buildRateLimitHeaders(rateLimit) }
            );
        }

        const contentType = req.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json(
                { error: 'Unsupported content type. Use application/json.' },
                { status: 415 }
            );
        }

        const rawBody = (await req.json()) as MidtransTransaction & { website?: string };
        if (typeof rawBody.website === 'string' && rawBody.website.trim().length > 0) {
            return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
        }

        const body: MidtransTransaction = rawBody;
        const { order_id, items, customer } = body;

        if (!ORDER_ID_PATTERN.test(order_id)) {
            return NextResponse.json(
                { error: 'Invalid order_id format' },
                { status: 400 }
            );
        }

        const existingOrder = await ordersRepository.getOrderByOrderId(order_id);
        if (existingOrder) {
            return NextResponse.json(
                {
                    error: 'Order already exists',
                    order_id: existingOrder.orderId,
                    status: existingOrder.transactionStatus,
                },
                { status: 409 }
            );
        }

        const paymentResult = await createPaymentWithCoreApi(body);
        const persistedGrossAmount = resolvePersistedGrossAmount(
            body.gross_amount,
            paymentResult.payment_data
        );

        const bodyToSave = {
            orderId: order_id,
            grossAmount: persistedGrossAmount,
            snapToken: null,
            items: JSON.stringify(items),
            customerName: customer?.name,
            customerEmail: customer?.email,
            customerPhone: customer?.phone,
            transactionStatus: paymentResult.transaction_status,
            paymentType: paymentResult.payment_method,
            paymentName: paymentResult.payment_name,
            paymentVa: paymentResult.payment_va,
            transactionId: (paymentResult.payment_data.transaction_id as string | undefined) || null,
        }
        try {
            await createPaymentService(bodyToSave);
        } catch (dbError) {
            console.error("[create-transaction] Failed to save order:", dbError);
            await reportErrorToSlack(dbError, { source: 'create-transaction', route: '/api/payment/create-transaction', method: 'POST' });
        }

        return NextResponse.json({
            order_id: paymentResult.order_id,
            status: paymentResult.transaction_status,
            payment_method: paymentResult.payment_method,
            payment_data: paymentResult.payment_data,
        });
    } catch (err) {
        console.error("[create-transaction]", err);
        await reportErrorToSlack(err, { source: 'create-transaction', route: '/api/payment/create-transaction', method: 'POST' });
        const message = err instanceof Error ? err.message : "Internal server error";
        const isClientError =
            message.includes("not enabled") ||
            message.includes("requires") ||
            message.includes("missing") ||
            message.includes("invalid");

        return NextResponse.json(
            { error: message },
            { status: isClientError ? 400 : 500 }
        );
    }
}
