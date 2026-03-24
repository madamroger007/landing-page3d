import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSession: vi.fn(),
}));

vi.mock('@/src/server/services/token', () => ({
    tokenService: {
        revokeToken: vi.fn(),
    },
}));

import { DELETE } from '@/src/app/api/auth/token/[id]/route';
import { requireSession } from '@/src/lib/auth/withAuth';
import { tokenService } from '@/src/server/services/token';

function makeRequest(): NextRequest {
    return {} as unknown as NextRequest;
}

describe('auth token by id route', () => {
    it('returns auth response when unauthenticated', async () => {
        vi.mocked(requireSession).mockResolvedValue(NextResponse.json({ success: false }, { status: 401 }));

        const response = await DELETE(makeRequest(), { params: Promise.resolve({ id: 'tok-1' }) });
        expect(response.status).toBe(401);
    });

    it('returns 404 when token not owned/found', async () => {
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.revokeToken).mockResolvedValue(false);

        const response = await DELETE(makeRequest(), { params: Promise.resolve({ id: 'tok-1' }) });
        expect(response.status).toBe(404);
    });

    it('revokes token when valid', async () => {
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.revokeToken).mockResolvedValue(true);

        const response = await DELETE(makeRequest(), { params: Promise.resolve({ id: 'tok-1' }) });
        expect(response.status).toBe(200);
        expect(tokenService.revokeToken).toHaveBeenCalledWith('tok-1', 'user-1');
    });
});
