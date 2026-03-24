import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SelectUser } from '@/src/server/db/schema/user';

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSession: vi.fn(),
}));

vi.mock('@/src/server/services/auth', () => ({
    authService: {
        getCurrentUser: vi.fn(),
    },
}));

import { GET } from '@/src/app/api/auth/me/route';
import { requireSession } from '@/src/lib/auth/withAuth';
import { authService } from '@/src/server/services/auth';

function makeSanitizedUser(): Omit<SelectUser, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'> {
    return {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

function makeRequest(): NextRequest {
    return {} as unknown as NextRequest;
}

describe('auth me route', () => {
    it('returns auth response when not authenticated', async () => {
        vi.mocked(requireSession).mockResolvedValue(NextResponse.json({ success: false }, { status: 401 }));

        const response = await GET(makeRequest());
        expect(response.status).toBe(401);
    });

    it('returns current user when found', async () => {
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(authService.getCurrentUser).mockResolvedValue({
            success: true,
            message: 'ok',
            user: makeSanitizedUser(),
        });

        const response = await GET(makeRequest());
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({
            success: true,
            user: { id: 'user-1', email: 'admin@example.com', role: 'admin' },
        });
    });
});
