import { describe, expect, it } from 'vitest';
import { extractPaymentPersistenceFields, normalizeProviderName } from '@/src/utils/payment';

describe('payment utils', () => {
    it('normalizeProviderName maps known provider values', () => {
        expect(normalizeProviderName('bca')).toBe('BCA');
        expect(normalizeProviderName('credit card')).toBe('Credit Card');
    });

    it('normalizeProviderName title-cases unknown values', () => {
        expect(normalizeProviderName('custom_pay_channel')).toBe('Custom Pay Channel');
    });

    it('extractPaymentPersistenceFields prioritizes preferred payment name', () => {
        const result = extractPaymentPersistenceFields(
            {
                payment_type: 'bank_transfer',
                va_numbers: [{ bank: 'bni', va_number: '12345678' }],
            },
            { preferredPaymentName: 'gopay' }
        );

        expect(result).toEqual({
            payment_name: 'GoPay',
            payment_va: '12345678',
        });
    });

    it('extractPaymentPersistenceFields resolves echannel fallback and bill key', () => {
        const result = extractPaymentPersistenceFields({
            payment_type: 'echannel',
            bill_key: '70012',
        });

        expect(result).toEqual({
            payment_name: 'Mandiri',
            payment_va: '70012',
        });
    });

    it('extractPaymentPersistenceFields deduplicates VA sources', () => {
        const result = extractPaymentPersistenceFields({
            payment_type: 'bank_transfer',
            va_numbers: [
                { bank: 'bca', va_number: '111' },
                { bank: 'bca', va_number: '111' },
            ],
            va_number: '111',
        });

        expect(result.payment_name).toBe('BCA');
        expect(result.payment_va).toBe('111');
    });
});
