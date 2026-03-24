import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

vi.mock('@/src/server/services/voucher', () => ({
    getVouchersService: vi.fn(),
    createVoucherService: vi.fn(),
}));

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireApiTokenRole: vi.fn(),
}));

import { GET, POST } from '@/src/app/api/voucher/route';
import { createVoucherService, getVouchersService } from '@/src/server/services/voucher';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';

function makeRequest(body: unknown): NextRequest {
    return {
        json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
}

describe('voucher route', () => {
    it('GET returns vouchers', async () => {
        vi.mocked(getVouchersService).mockResolvedValue([{ id: 1, code: 'DISC10' }] as never);

        const response = await GET();
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ vouchers: [{ id: 1, code: 'DISC10' }] });
    });

    it('POST returns auth response when role check fails', async () => {
        vi.mocked(requireApiTokenRole).mockResolvedValue(NextResponse.json({ success: false }, { status: 403 }));

        const response = await POST(makeRequest({ code: 'DISC10', discount: 10 }));
        expect(response.status).toBe(403);
    });

    it('POST creates voucher when valid', async () => {
        vi.mocked(requireApiTokenRole).mockResolvedValue({ userId: 'admin-1', role: 'admin' });
        vi.mocked(createVoucherService).mockResolvedValue({ id: 1, code: 'DISC10' } as never);

        const response = await POST(
            makeRequest({
                code: 'DISC10',
                discount: '10',
                expiredAt: new Date(Date.now() + 3600_000).toISOString(),
            })
        );

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({ success: true });
    });
});
