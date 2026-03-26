import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/src/server/db';
import { usersTable } from '@/src/server/db/schema/user';
import { authRepository } from '@/src/server/repositories/auth';
import { authService } from '@/src/server/services/auth';
import { POST as forgotPasswordPOST } from '@/src/app/api/auth/forgot-password/route';
import { GET as validateResetTokenGET, POST as resetPasswordPOST } from '@/src/app/api/auth/reset-password/route';

const { mockSend } = vi.hoisted(() => ({
    mockSend: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
}));

vi.mock('resend', () => ({
    Resend: class {
        emails = {
            send: mockSend,
        };
    },
}));

vi.mock('@/src/server/lib/slack-error-reporter', () => ({
    reportErrorToSlack: vi.fn().mockResolvedValue(undefined),
}));
describe('auth password flow integration', () => {
    beforeEach(async () => {
        await db.delete(usersTable);
        mockSend.mockClear();
    });

    it('forgot-password stores reset token for existing user and returns 200', async () => {
        await authService.registerUser({
            name: 'Reset User',
            email: 'reset-user@example.com',
            password: 'Password123',
            role: 'user',
        });

        const request = new Request('http://localhost/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'reset-user@example.com' }),
        });

        const response = await forgotPasswordPOST(request as never);
        expect(response.status).toBe(200);

        const user = await authRepository.findUserByEmail('reset-user@example.com');
        expect(user?.resetPasswordToken).toBeTruthy();
        expect(user?.resetPasswordExpires).toBeTruthy();
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('reset-password validates token and updates password', async () => {
        await authService.registerUser({
            name: 'Password Update User',
            email: 'password-update@example.com',
            password: 'Password123',
            role: 'user',
        });

        const resetRequest = await authService.requestPasswordReset('password-update@example.com');
        expect(resetRequest.success).toBe(true);
        expect(resetRequest.token).toBeTruthy();

        const validateResponse = await validateResetTokenGET(
            new Request(`http://localhost/api/auth/reset-password?token=${resetRequest.token}`) as never
        );
        expect(validateResponse.status).toBe(200);
        await expect(validateResponse.json()).resolves.toMatchObject({ success: true, valid: true });

        const updateResponse = await resetPasswordPOST(
            new Request('http://localhost/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: resetRequest.token,
                    password: 'NewPassword123',
                    confirmPassword: 'NewPassword123',
                }),
            }) as never
        );

        expect(updateResponse.status).toBe(200);

    });

    it('forgot-password for unknown email still returns 200 and sends no email', async () => {
        const request = new Request('http://localhost/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'unknown@example.com' }),
        });

        const response = await forgotPasswordPOST(request as never);
        expect(response.status).toBe(200);
        expect(mockSend).not.toHaveBeenCalled();
    });
});
