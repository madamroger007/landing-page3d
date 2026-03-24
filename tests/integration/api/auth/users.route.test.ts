import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { SelectUser } from '@/src/server/db/schema/user';

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSessionRole: vi.fn(),
}));

vi.mock('@/src/server/repositories/auth', () => ({
    authRepository: {
        getUsers: vi.fn(),
    },
}));

vi.mock('@/src/server/services/auth', () => ({
    authService: {
        registerUser: vi.fn(),
    },
}));

import { GET } from '@/src/app/api/auth/users/route';
import { requireSessionRole } from '@/src/lib/auth/withAuth';
import { authRepository } from '@/src/server/repositories/auth';

function makeUser(): SelectUser {
    return {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@example.com',
        password: 'hashed-password',
        role: 'admin',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

describe('GET /api/auth/users', () => {
    it('returns auth response when session role check fails', async () => {
        vi.mocked(requireSessionRole).mockResolvedValue(
            NextResponse.json({ success: false }, { status: 401 })
        );

        const response = await GET();

        expect(response.status).toBe(401);
    });

    it('returns sanitized users for admin session', async () => {
        vi.mocked(requireSessionRole).mockResolvedValue({ userId: 'admin-1', role: 'admin' });
        vi.mocked(authRepository.getUsers).mockResolvedValue([makeUser()]);

        const response = await GET();
        const payload = (await response.json()) as { users: Array<Record<string, unknown>>; success: boolean };

        expect(response.status).toBe(200);
        expect(payload.success).toBe(true);
        expect(payload.users[0]).toMatchObject({
            id: 'user-1',
            email: 'admin@example.com',
            role: 'admin',
        });
        expect(payload.users[0]).not.toHaveProperty('password');
        expect(payload.users[0]).not.toHaveProperty('resetPasswordToken');
    });
});
