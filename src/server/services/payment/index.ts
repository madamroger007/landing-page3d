import { Item, MidtransTransaction } from "@/src/types/type";
import { midtransProvider } from "@/src/server/providers/midtransProvider";
import { extractPaymentPersistenceFields, PaymentPersistenceFields } from "@/src/utils/payment";
import { InsertOrder } from "../../db/schema/orders";
import { ordersRepository } from "../../repositories/orders";
import { SendPaymentLinkEmail } from "../email";

type PaymentServiceResult = PaymentPersistenceFields & {
    order_id: string;
    transaction_status: string;
    payment_method: string;
    payment_data: Record<string, unknown>;
};


function resolvePaymentPayload(paymentMethod: string, orderId: string, cardTokenId?: string) {
    switch (paymentMethod) {
        case "qris":
            return { payment_type: "qris", qris: { acquirer: "gopay" } };
        case "gopay":
            return { payment_type: "gopay" };
        case "dana":
            return { payment_type: "qris", qris: { acquirer: "gopay" } };
        case "bni_va":
            return { payment_type: "bank_transfer", bank_transfer: { bank: "bni" } };
        case "bri_va":
            return { payment_type: "bank_transfer", bank_transfer: { bank: "bri" } };
        case "seabank":
            return { payment_type: "bank_transfer", bank_transfer: { bank: "seabank" }  };
        case "mandiri_va":
            return {
                payment_type: "echannel",
                echannel: {
                    bill_info1: "Payment For",
                    bill_info2: orderId,
                },
            };
        case "credit_card":
            if (!cardTokenId) {
                throw new Error("Credit card token is missing. Please retry card tokenization.");
            }

            return {
                payment_type: "credit_card",
                credit_card: {
                    token_id: cardTokenId,
                    authentication: true,
                },
            };
        default:
            return { payment_type: "qris", qris: { acquirer: "gopay" } };
    }
}

function normalizeItemDetails(items: Item[], grossAmount: number) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const adjustment = grossAmount - subtotal;

    const itemDetails = items.map((item) => ({
        id: String(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
    }));

    if (adjustment !== 0) {
        itemDetails.push({
            id: adjustment > 0 ? "payment-fee" : "discount-adjustment",
            name: adjustment > 0 ? "Payment Fee" : "Discount",
            price: adjustment,
            quantity: 1,
        });
    }

    return itemDetails;
}

function extractPaymentData(chargeResult: Record<string, unknown>, preferredPaymentName?: string) {
    const actions = Array.isArray(chargeResult.actions)
        ? (chargeResult.actions as Array<{ name?: string; url?: string }>)
        : [];

    const qrisAction =
        actions.find((a) => a.name === "generate-qr-code") ||
        actions.find((a) => a.name?.toLowerCase().includes("qr")) ||
        actions.find((a) => a.url?.toLowerCase().includes("qr"));

    const deeplinkAction =
        actions.find((a) => a.name?.toLowerCase().includes("deeplink")) ||
        actions.find((a) => a.name?.toLowerCase().includes("redirect"));

    const persistenceFields = extractPaymentPersistenceFields(chargeResult, {
        preferredPaymentName,
    });

    return {
        payment_method: chargeResult.payment_type,
        payment_name: persistenceFields.payment_name,
        payment_va: persistenceFields.payment_va,
        va_numbers: chargeResult.va_numbers,
        biller_code: chargeResult.biller_code,
        bill_key: chargeResult.bill_key,
        payment_code: chargeResult.payment_code,
        transaction_id: chargeResult.transaction_id,
        bank: chargeResult.bank,
        masked_card: chargeResult.masked_card,
        card_type: chargeResult.card_type,
        store: chargeResult.store,
        redirect_url: chargeResult.redirect_url,
        qris_url: qrisAction?.url,
        deeplink_url: deeplinkAction?.url,
        raw_snap_result: chargeResult,
    };
}

export async function createPaymentWithCoreApi(payload: MidtransTransaction): Promise<PaymentServiceResult> {
    if (!Number.isFinite(payload.gross_amount) || payload.gross_amount <= 0) {
        throw new Error("Gross amount must be greater than 0.");
    }

    const paymentMethod = payload.payment_method || "qris";
    const methodPayload = resolvePaymentPayload(paymentMethod, payload.order_id, payload.card_token_id);
    const chargePayload = {
        ...methodPayload,
        transaction_details: {
            order_id: payload.order_id,
            gross_amount: payload.gross_amount,
        },
        item_details: normalizeItemDetails(payload.items, payload.gross_amount),
        customer_details: payload.customer
            ? {
                first_name: payload.customer.name || "Customer",
                email: payload.customer.email || "customer@example.com",
                phone: payload.customer.phone || "081234567890",
            }
            : undefined,
    };

    const chargeResult = await midtransProvider.createCharge(chargePayload);
    const paymentData = extractPaymentData(chargeResult, paymentMethod);

    return {
        order_id: payload.order_id,
        transaction_status: (chargeResult.transaction_status as string) || "pending",
        payment_method: (chargeResult.payment_type as string) || paymentMethod,
        payment_name: (paymentData.payment_name as string | null | undefined) ?? null,
        payment_va: (paymentData.payment_va as string | null | undefined) ?? null,
        payment_data: paymentData,
    };
}


export async function createPaymentService(item: InsertOrder) {
    await ordersRepository.createOrder({
        orderId: item.orderId,
        grossAmount: item.grossAmount,
        snapToken: null,
        items: item.items,
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        customerPhone: item.customerPhone,
        transactionStatus: item.transactionStatus,
        paymentType: item.paymentType,
        paymentName: item.paymentName,
        paymentVa: item.paymentVa,
        transactionId: item.transactionId,
    });

    await SendPaymentLinkEmail({
        email: item.customerEmail || "customer@example.com",
        name: item.customerName || "Customer",
        order_id: item.orderId,
        total: item.grossAmount,
        items: item.items,
    });
}