import { describe, expect, it, vi } from 'vitest';
import type { SelectUser } from '@/src/server/db/schema/user';

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

vi.mock('@/src/server/repositories/auth', () => ({
    authRepository: {
        findUserByEmail: vi.fn(),
        findUserById: vi.fn(),
        findUserByResetToken: vi.fn(),
        createUser: vi.fn(),
        setResetToken: vi.fn(),
        updateUserPassword: vi.fn(),
    },
}));

import bcrypt from 'bcryptjs';
import { authRepository } from '@/src/server/repositories/auth';
import { authService } from '@/src/server/services/auth';

function makeUser(overrides: Partial<SelectUser> = {}): SelectUser {
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
        ...overrides,
    };
}

describe('authService', () => {
    it('loginUser returns generic failure when user not found', async () => {
        vi.mocked(authRepository.findUserByEmail).mockResolvedValue(undefined);

        const result = await authService.loginUser('missing@example.com', 'Password1');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid email or password');
    });

    it('loginUser succeeds with valid credentials', async () => {
        vi.mocked(authRepository.findUserByEmail).mockResolvedValue(makeUser());
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
        vi.spyOn(authService, 'generateToken').mockResolvedValue('jwt-token');

        const result = await authService.loginUser('admin@example.com', 'Password1');

        expect(result.success).toBe(true);
        expect(result.token).toBe('jwt-token');
        expect(result.user).toMatchObject({ id: 'user-1', email: 'admin@example.com' });
        expect(result.user).not.toHaveProperty('password');
    });

    it('registerUser rejects duplicate email', async () => {
        vi.mocked(authRepository.findUserByEmail).mockResolvedValue(makeUser());

        const result = await authService.registerUser({
            name: 'New',
            email: 'admin@example.com',
            password: 'Password1',
            role: 'user',
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email already registered');
    });

    it('requestPasswordReset returns success without token when user missing', async () => {
        vi.mocked(authRepository.findUserByEmail).mockResolvedValue(undefined);

        const result = await authService.requestPasswordReset('missing@example.com');

        expect(result).toEqual({ success: true });
    });
});
