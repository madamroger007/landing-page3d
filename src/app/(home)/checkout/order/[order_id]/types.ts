export type DbOrderInfo = {
    orderId: string;
    orderLabel: string | null;
    productLink: string | null;
    transactionStatus: string | null;
};

export type OrderLabel = "progress" | "revisi" | "done" | "pending" | "cancelled";