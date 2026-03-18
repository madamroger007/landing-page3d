import { NextRequest, NextResponse } from "next/server";
import { MidtransTransaction } from "@/src/types/type";
import { createPaymentService, createPaymentWithCoreApi } from "@/src/server/services/payment";

/** POST /api/payment/create-transaction — Core API charge flow */
export async function POST(req: NextRequest) {
    try {
        const body: MidtransTransaction = await req.json();
        const { order_id, gross_amount, items, customer } = body;
        const paymentResult = await createPaymentWithCoreApi(body);
        const bodyToSave = {
            orderId: order_id,
            grossAmount: gross_amount,
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
        }

        return NextResponse.json({
            order_id: paymentResult.order_id,
            status: paymentResult.transaction_status,
            payment_method: paymentResult.payment_method,
            payment_data: paymentResult.payment_data,
        });
    } catch (err) {
        console.error("[create-transaction]", err);

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
