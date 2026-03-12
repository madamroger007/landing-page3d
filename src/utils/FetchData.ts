import { MidtransTransaction, Product } from "../types/type";



export const FecthDataUser = async () => {
    try {
        const response = await fetch('/api/auth/users');
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || 'Failed to fetch users' };
        }
        return data
    } catch {
        console.error('Failed to fetch user');
        return { message: 'An unexpected error occurred' };
    }
}

export const FecthDataVoucher = async () => {
    try {
        const response = await fetch('/api/voucher');
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || 'Failed to fetch users' };
        }
        return data
    } catch {
        console.error('Failed to fetch user');
        return { message: 'An unexpected error occurred' };
    }
}


export async function CreateTransaction(payload: MidtransTransaction) {
    const res = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to create transaction");

    const { snap_token } = await res.json();
    return snap_token;
}