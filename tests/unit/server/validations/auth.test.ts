import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from '@/src/server/validations/auth';

describe('auth validation schema', () => {
    it('accepts valid login payload', () => {
        const result = loginSchema.safeParse({
            email: 'user@example.com',
            password: 'pass123',
        });

        expect(result.success).toBe(true);
    });

    it('rejects weak register password', () => {
        const result = registerSchema.safeParse({
            name: 'User',
            email: 'user@example.com',
            password: 'weakpass',
            role: 'user',
        });

        expect(result.success).toBe(false);
    });

    it('rejects reset password mismatch', () => {
        const result = resetPasswordSchema.safeParse({
            token: 'token123',
            password: 'StrongPass1',
            confirmPassword: 'StrongPass2',
        });

        expect(result.success).toBe(false);
    });
});
