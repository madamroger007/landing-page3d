'use server';
import { cachedVoucherRepository } from '../../repositories/voucher/cached';
// ─── Vouchers Server Actions ─────────────────────────────────────────────────
export async function fetchVouchers() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/voucher`, {
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        cache: 'no-store',
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

export async function validateVoucherByCode(code: string) {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
        return { valid: false, message: 'Voucher code is required' };
    }

    const voucher = await cachedVoucherRepository.getVoucherByCode(normalizedCode);
    if (!voucher) {
        return { valid: false, message: 'Voucher not found' };
    }

    const isExpired = new Date(voucher.expiredAt).getTime() < Date.now();
    if (isExpired) {
        return { valid: false, message: 'Voucher expired' };
    }

    return {
        valid: true,
        message: 'Voucher applied',
        code: voucher.code,
        discountPercent: Number(voucher.discount),
    };
}
