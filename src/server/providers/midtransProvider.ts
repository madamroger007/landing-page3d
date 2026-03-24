import midtransClient from "midtrans-client";
import { reportErrorToSlack } from "../lib/slack-error-reporter";

type MidtransRequestBody = Record<string, unknown>;

type MidtransClientError = Error & {
    ApiResponse?: Record<string, unknown>;
    httpStatusCode?: number;
};

const serverKey = process.env.MIDTRANS_SERVER_KEY;
if (!serverKey) {
    throw new Error("Midtrans server key not configured");
}

const isProductionByBaseUrl = process.env.MIDTRANS_BASE_URL === "https://api.midtrans.com";

const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true" || isProductionByBaseUrl,
    serverKey,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

const coreApiTransactionActions = (coreApi as unknown as {
    transaction: {
        status: (orderId: string) => Promise<unknown>;
        cancel: (orderId: string) => Promise<unknown>;
    };
}).transaction;

function toReadableMidtransError(error: unknown, fallbackMessage: string) {
    const err = error as MidtransClientError;
    const apiResponse = err.ApiResponse;

    const statusMessage = typeof apiResponse?.status_message === "string" ? apiResponse.status_message : "";
    const validationMessages = Array.isArray(apiResponse?.validation_messages)
        ? apiResponse.validation_messages.filter((message: unknown): message is string => typeof message === "string")
        : [];
    const errorMessages = Array.isArray(apiResponse?.error_messages)
        ? apiResponse.error_messages.filter((message: unknown): message is string => typeof message === "string")
        : [];

    const details = [err.message, statusMessage, ...validationMessages, ...errorMessages]
        .filter(Boolean)
        .join(" | ");

    return new Error(details || fallbackMessage);
}

export const midtransProvider = {
    async createCharge(payload: MidtransRequestBody) {
        try {
            return (await coreApi.charge(payload)) as Record<string, unknown>;
        } catch (error) {
            await reportErrorToSlack(error, { source: 'midtrans-create-charge', route: 'server/providers/midtransProvider', method: 'POST' });
            throw toReadableMidtransError(error, "Midtrans charge failed");
        }
    },

    async checkTransaction(orderId: string) {
        try {
            return (await coreApiTransactionActions.status(orderId)) as Record<string, unknown>;
        } catch (error) {
            await reportErrorToSlack(error, { source: 'midtrans-check-transaction', route: 'server/providers/transaction-status', method: 'GET' });
            throw toReadableMidtransError(error, "Failed to fetch Midtrans transaction status");
        }
    },

    async cancelTransaction(orderId: string) {
        try {
            return (await coreApiTransactionActions.cancel(orderId)) as Record<string, unknown>;
        } catch (error) {
            await reportErrorToSlack(error, { source: 'midtrans-cancel-transaction', route: 'server/providers/cancel-transaction', method: 'POST' });
            throw toReadableMidtransError(error, "Failed to cancel Midtrans transaction");
        }
    },
};
