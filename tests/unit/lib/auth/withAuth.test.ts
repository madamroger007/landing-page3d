import { describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { SelectUser } from '@/src/server/db/schema/user';

vi.mock('@/src/server/services/token', () => ({
    tokenService: {
        validateToken: vi.fn(),
    },
}));

vi.mock('@/src/server/repositories/auth', () => ({
    authRepository: {
        findUserById: vi.fn(),
    },
}));

import { authRepository } from '@/src/server/repositories/auth';
import { tokenService } from '@/src/server/services/token';
import { requireApiToken, requireApiTokenRole } from '@/src/lib/auth/withAuth';

function makeBearerRequest(token?: string): NextRequest {
    const headers = new Headers();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return { headers } as unknown as NextRequest;
}

function makeUser(role: SelectUser['role']): SelectUser {
    return {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        role,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

describe('withAuth API token guards', () => {
    it('returns 401 when bearer token is missing', async () => {
        const request = makeBearerRequest();

        const response = await requireApiToken(request);

        expect(response).toBeInstanceOf(Response);
        if (response instanceof Response) {
            expect(response.status).toBe(401);
            await expect(response.json()).resolves.toMatchObject({
                success: false,
            });
        }
    });

    it('returns 403 when role does not match', async () => {
        vi.mocked(tokenService.validateToken).mockResolvedValue({
            tokenId: 'token-1',
            userId: 'user-1',
        });
        vi.mocked(authRepository.findUserById).mockResolvedValue(makeUser('user'));

        const request = makeBearerRequest('valid-token');

        const response = await requireApiTokenRole(request, 'admin');

        expect(response).toBeInstanceOf(Response);
        if (response instanceof Response) {
            expect(response.status).toBe(403);
            await expect(response.json()).resolves.toMatchObject({
                success: false,
            });
        }
    });

    it('returns auth context when token and role are valid', async () => {
        vi.mocked(tokenService.validateToken).mockResolvedValue({
            tokenId: 'token-1',
            userId: 'user-1',
        });
        vi.mocked(authRepository.findUserById).mockResolvedValue(makeUser('admin'));

        const request = makeBearerRequest('valid-token');

        const result = await requireApiTokenRole(request, 'admin');

        expect(result).toEqual({ userId: 'user-1', role: 'admin' });
    });
});
