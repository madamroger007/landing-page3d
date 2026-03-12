
// ─── Vouchers Server Actions ─────────────────────────────────────────────────
export async function fetchVouchers() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/voucher`, {
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });
    return response.json();
}

export async function createVoucher(formData: {
    code: string;
    discount: string;
    expiredAt: string;
}) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/voucher`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
    });

    return response.json();
}

export async function updateVoucher(
    voucherId: number,
    formData: {
        code: string;
        discount: string;
        expiredAt: string;
    }
) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/voucher/${voucherId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
    });

    return response.json();
}

export async function deleteVoucher(voucherId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/voucher/${voucherId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}
