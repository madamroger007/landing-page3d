import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/server/repositories/voucher/cached', () => ({
    cachedVoucherRepository: {
        getVouchers: vi.fn(),
        createVoucher: vi.fn(),
        getVoucherById: vi.fn(),
        updateVoucher: vi.fn(),
        deleteVoucher: vi.fn(),
    },
}));

import { cachedVoucherRepository } from '@/src/server/repositories/voucher/cached';
import {
    createVoucherService,
    deleteVoucherService,
    getVoucherByIdService,
    getVouchersService,
    updateVoucherService,
} from '@/src/server/services/voucher';

describe('voucherService', () => {
    it('returns vouchers list', async () => {
        vi.mocked(cachedVoucherRepository.getVouchers).mockResolvedValue([{ id: 1, code: 'DISC10' }] as never);

        const result = await getVouchersService();

        expect(result).toEqual([{ id: 1, code: 'DISC10' }]);
    });

    it('createVoucherService appends timestamps', async () => {
        await createVoucherService({
            code: 'DISC10',
            discount: '10',
            expiredAt: new Date(Date.now() + 3600_000).toISOString(),
        });

        expect(cachedVoucherRepository.createVoucher).toHaveBeenCalledWith(
            expect.objectContaining({
                code: 'DISC10',
                discount: '10',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        );
    });

    it('getVoucherByIdService returns repository result', async () => {
        vi.mocked(cachedVoucherRepository.getVoucherById).mockResolvedValue({ id: 5, code: 'DISC5' } as never);

        const result = await getVoucherByIdService(5);

        expect(result).toEqual({ id: 5, code: 'DISC5' });
    });

    it('update/delete only execute when voucher exists', async () => {
        vi.mocked(cachedVoucherRepository.getVoucherById)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ id: 8, code: 'DISC8' } as never)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ id: 9, code: 'DISC9' } as never);

        await updateVoucherService({ id: 8 } as never);
        await updateVoucherService({ id: 8, code: 'DISC8' } as never);
        await deleteVoucherService(9);
        await deleteVoucherService(9);

        expect(cachedVoucherRepository.updateVoucher).toHaveBeenCalledTimes(1);
        expect(cachedVoucherRepository.deleteVoucher).toHaveBeenCalledTimes(1);
        expect(cachedVoucherRepository.deleteVoucher).toHaveBeenCalledWith(9);
    });
});
