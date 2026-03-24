import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { TokenView } from '@/src/server/services/token';

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSession: vi.fn(),
}));

vi.mock('@/src/server/services/token', () => ({
    tokenService: {
        listTokens: vi.fn(),
        generateToken: vi.fn(),
        revokeAllTokens: vi.fn(),
    },
}));

import { GET, POST, DELETE } from '@/src/app/api/auth/token/route';
import { requireSession } from '@/src/lib/auth/withAuth';
import { tokenService } from '@/src/server/services/token';

function makeTokenView(): TokenView {
    return {
        id: 't1',
        userId: 'user-1',
        name: 'ci',
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

function makeRequest(body: unknown): NextRequest {
    return {
        json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
}

describe('auth token route', () => {
    it('GET returns auth response when unauthenticated', async () => {
        vi.mocked(requireSession).mockResolvedValue(NextResponse.json({ success: false }, { status: 401 }));

        const response = await GET(makeRequest({}));
        expect(response.status).toBe(401);
    });

    it('GET lists user tokens', async () => {
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.listTokens).mockResolvedValue([{ id: 't1', name: 'main' }] as never);

        const response = await GET(makeRequest({}));
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ success: true, tokens: [{ id: 't1', name: 'main' }] });
    });

    it('POST generates token for authenticated user', async () => {
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.generateToken).mockResolvedValue({
            raw: 'raw-token',
            token: makeTokenView(),
        });

        const response = await POST(makeRequest({ name: 'ci' }));
        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({ success: true, token: 'raw-token' });
    });

    it('DELETE revokes all tokens for authenticated user', async () => {
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });

        const response = await DELETE(makeRequest({}));
        expect(response.status).toBe(200);
        expect(tokenService.revokeAllTokens).toHaveBeenCalledWith('user-1');
    });
});
