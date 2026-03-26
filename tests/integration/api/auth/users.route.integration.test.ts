import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/src/server/db';
import { usersTable } from '@/src/server/db/schema/user';
import { authRepository } from '@/src/server/repositories/auth';
import { authService } from '@/src/server/services/auth';
import { requireSession } from '@/src/lib/auth/withAuth';
import { GET as listUsersGET, POST as createUserPOST } from '@/src/app/api/auth/users/route';
import { GET as userByIdGET, PATCH as userByIdPATCH, DELETE as userByIdDELETE } from '@/src/app/api/auth/users/[id]/route';
import { User } from '@/src/types/type';
import { NextRequest } from 'next/dist/server/web/spec-extension/request';

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSession: vi.fn(),
}));

vi.mock('@/src/server/lib/slack-error-reporter', () => ({
    reportErrorToSlack: vi.fn().mockResolvedValue(undefined),
}));

describe('auth users route integration', () => {
    beforeEach(async () => {
        await db.delete(usersTable);
    });

    it('GET /api/auth/users returns sanitized users from database', async () => {
        const admin = await authService.registerUser({
            name: 'Admin Integration',
            email: 'admin-integration@example.com',
            password: 'Password123',
            role: 'admin',
        });

        const standardUser = await authService.registerUser({
            name: 'User Integration',
            email: 'user-integration@example.com',
            password: 'Password123',
            role: 'user',
        });
    

        expect(admin.success).toBe(true);
        expect(standardUser.success).toBe(true);

        vi.mocked(requireSession).mockResolvedValue({ userId: admin.user!.id, role: 'admin' });

        const response = await listUsersGET();
        expect(response.status).toBe(200);

        const payload = (await response.json()) as { success: boolean; users: User[] };
        // show data
        payload.users.forEach((user) => {
            expect(user).not.toHaveProperty('password');
            expect(user).not.toHaveProperty('resetPasswordToken');
        });
    });

    it('POST /api/auth/users creates user with hashed password', async () => {
        const admin = await authService.registerUser({
            name: 'Admin Creator',
            email: 'admin-creator@example.com',
            password: 'Password123',
            role: 'admin',
        });

        vi.mocked(requireSession).mockResolvedValue({ userId: admin.user!.id, role: 'admin' });

        const response = await createUserPOST(
            new Request('http://localhost/api/auth/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Created User',
                    email: 'created-user@example.com',
                    password: 'Password123',
                    role: 'user',
                }),
            }) as never
        );

        expect(response.status).toBe(201);

        const createdUser = await authRepository.findUserByEmail('created-user@example.com');
        expect(createdUser?.password).toBeTruthy();
        expect(createdUser?.password).not.toBe('Password123');
    });

    it('GET /api/auth/users/[id] allows owner access and PATCH updates real record', async () => {
        const user = await authService.registerUser({
            name: 'Profile Owner',
            email: 'profile-owner@example.com',
            password: 'Password123',
            role: 'user',
        });

        vi.mocked(requireSession).mockResolvedValue({ userId: user.user!.id, role: 'user' });

        const request = new NextRequest(`http://localhost/api/auth/users/${user.user!.id}`, { method: 'GET' });
        const getOwnResponse = await userByIdGET(request, { params: Promise.resolve({ id: user.user!.id }) });
        expect(getOwnResponse.status).toBe(200);

        vi.mocked(requireSession).mockResolvedValue({ userId: user.user!.id, role: 'admin' });

        const patchResponse = await userByIdPATCH(
            new Request(`http://localhost/api/auth/users/${user.user!.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Profile Owner Updated' }),
            }) as never,
            { params: Promise.resolve({ id: user.user!.id }) }
        );

        expect(patchResponse.status).toBe(200);

        const updatedUser = await authRepository.findUserById(user.user!.id);
        expect(updatedUser?.name).toBe('Profile Owner Updated');
    });

    it('DELETE /api/auth/users/[id] deletes user from database', async () => {
        const admin = await authService.registerUser({
            name: 'Delete Admin',
            email: 'delete-admin@example.com',
            password: 'Password123',
            role: 'admin',
        });

        const target = await authService.registerUser({
            name: 'Delete Target',
            email: 'delete-target@example.com',
            password: 'Password123',
            role: 'user',
        });

        vi.mocked(requireSession).mockResolvedValue({ userId: admin.user!.id, role: 'admin' });

        const request = new NextRequest(`http://localhost/api/auth/users/${target.user!.id}`, { method: 'DELETE' });
        const deleteResponse = await userByIdDELETE(request, { params: Promise.resolve({ id: target.user!.id }) });
        expect(deleteResponse.status).toBe(200);

        const deleted = await authRepository.findUserById(target.user!.id);
        expect(deleted).toBeUndefined();
    });
});
