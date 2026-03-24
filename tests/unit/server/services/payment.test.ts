import { describe, expect, it, vi } from 'vitest';
import type { MidtransTransaction } from '@/src/types/type';

vi.mock('@/src/server/providers/midtransProvider', () => ({
    midtransProvider: {
        createCharge: vi.fn(),
    },
}));

vi.mock('@/src/server/repositories/orders', () => ({
    ordersRepository: {
        createOrder: vi.fn(),
    },
}));

vi.mock('@/src/server/services/email', () => ({
    SendPaymentLinkEmail: vi.fn(),
}));

import { midtransProvider } from '@/src/server/providers/midtransProvider';
import { ordersRepository } from '@/src/server/repositories/orders';
import { SendPaymentLinkEmail } from '@/src/server/services/email';
import { createPaymentService, createPaymentWithCoreApi } from '@/src/server/services/payment';

function makePayload(overrides: Partial<MidtransTransaction> = {}): MidtransTransaction {
    return {
        order_id: 'ORDER-12345',
        gross_amount: 120000,
        payment_method: 'qris',
        items: [{ id: 1, name: 'Item A', price: 100000, quantity: 1 }],
        customer: { name: 'User', email: 'user@example.com', phone: '0812' },
        ...overrides,
    };
}

describe('paymentService', () => {
    it('rejects non-positive gross amount', async () => {
        await expect(createPaymentWithCoreApi(makePayload({ gross_amount: 0 }))).rejects.toThrow(
            'Gross amount must be greater than 0.'
        );
    });

    it('requires card token when payment method is credit_card', async () => {
        await expect(
            createPaymentWithCoreApi(makePayload({ payment_method: 'credit_card', card_token_id: undefined }))
        ).rejects.toThrow('Credit card token is missing. Please retry card tokenization.');
    });

    it('creates charge payload and maps provider response', async () => {
        vi.mocked(midtransProvider.createCharge).mockResolvedValue({
            payment_type: 'qris',
            transaction_status: 'pending',
            actions: [{ name: 'generate-qr-code', url: 'https://qr.example.com' }],
            transaction_id: 'trx-1',
            gross_amount: '120000',
        });

        const result = await createPaymentWithCoreApi(makePayload());

        expect(result.order_id).toBe('ORDER-12345');
        expect(result.transaction_status).toBe('pending');
        expect(result.payment_data).toMatchObject({ qris_url: 'https://qr.example.com' });
    });

    it('persists order and sends payment link email', async () => {
        await createPaymentService({
            orderId: 'ORDER-1',
            grossAmount: 100000,
            snapToken: null,
            items: '[]',
            customerName: 'User',
            customerEmail: 'user@example.com',
            customerPhone: '0812',
            transactionStatus: 'pending',
            paymentType: 'qris',
            paymentName: 'QRIS',
            paymentVa: null,
            transactionId: null,
        });

        expect(ordersRepository.createOrder).toHaveBeenCalledTimes(1);
        expect(SendPaymentLinkEmail).toHaveBeenCalledWith(
            expect.objectContaining({ order_id: 'ORDER-1', email: 'user@example.com' })
        );
    });
});
