// Get /api/auth/users/[id] route tests

import { beforeAll, describe, expect, it, vi } from "vitest";
import { GET, DELETE, PATCH } from "@/src/app/api/auth/users/[id]/route";
import { requireSession } from "@/src/lib/auth/withAuth";
import { authRepository } from "@/src/server/repositories/auth";
import { makeUser } from "./utils";
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

// Mock dependencies
vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSession: vi.fn(),
}));

vi.mock('@/src/server/repositories/auth', () => ({
    authRepository: {
        createUser: vi.fn(),
        findUserById: vi.fn(),
        deleteUser: vi.fn(),
        updateUser: vi.fn(),
    },
}));
describe(' User /api/auth/users/[id]', () => {
    // before all tests, create a user in the mock repository
    beforeAll(async () => {
        await authRepository.createUser(makeUser());
        vi.mocked(authRepository.createUser).mockResolvedValue(makeUser());
    });

    // Get /api/auth/users/[id] tests
    describe('GET /api/auth/users/[id]', () => {
        // check requireSession success case and response 200
        it('should return user data for a valid user and return 200', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.findUserById).mockResolvedValue(makeUser());
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-1', { method: 'GET' });
            const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.findUserById).toHaveBeenCalledWith('user-1');
            expect(response.status).toBe(200);
        });

        // check requireSession failure case (no token)
        it('should return 401 if not authenticated and it has no auth token', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue(NextResponse.json({ success: false }, { status: 401 }));
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-1', { method: 'GET' });
            const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(response.status).toBe(401);
        });

        // check user not found case response 404
        it('should return 404 if user not found', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.findUserById).mockResolvedValue(undefined);
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/nonexistent-user', { method: 'GET' });
            const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent-user' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.findUserById).toHaveBeenCalledWith('nonexistent-user');
            expect(response.status).toBe(404);
        });
        // check access denied case for non-admin user trying to access another user's profile response 403
        it('should return 403 if non-admin user tries to access another user profile', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'user' });
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-2', { method: 'GET' });
            const response = await GET(request, { params: Promise.resolve({ id: 'user-2' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(response.status).toBe(403);
        });

        // check get response status 500 case
        it('should return 500 if there is an error', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.findUserById).mockRejectedValue(new Error('Database error'));
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-1', { method: 'GET' });
            const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.findUserById).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });

    // PATH /api/auth/users/[id] tests
    describe('PATCH /api/auth/users/[id]', () => {
        // check requireSession success case and response 200
        it('should update user data for a valid user and return 200', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.updateUser).mockResolvedValue(makeUser());
            const request = new NextRequest('http://localhost/api/auth/users/user-1', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated Name' }),
            });
            // Act
            const response = await PATCH(request as NextRequest, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.updateUser).toHaveBeenCalledWith('user-1', { name: 'Updated Name' });
            expect(response.status).toBe(200);
        });

        // check requireSession failure case (no token)
        it('should return 401 if not authenticated and it has no auth token', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue(NextResponse.json({ success: false }, { status: 401 }));
            const request = new NextRequest('http://localhost/api/auth/users/user-1', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated Name' }),
            });
            // Act
            const response = await PATCH(request as NextRequest, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(response.status).toBe(401);
        });

        // check user not found case response 404
        it('should return 404 if user not found', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.updateUser).mockResolvedValue(undefined);
            const request = new NextRequest('http://localhost/api/auth/users/nonexistent-user', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated Name' }),
            });
            // Act
            const response = await PATCH(request as NextRequest, { params: Promise.resolve({ id: 'nonexistent-user' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.updateUser).toHaveBeenCalledWith('nonexistent-user', { name: 'Updated Name' });
            expect(response.status).toBe(404);
        });

        // validation failure case response 400
        it('should return 400 if validation fails', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            const request = new NextRequest('http://localhost/api/auth/users/user-1', {
                method: 'PATCH',
                body: JSON.stringify({ name: '' }),
            });
            // Act
            const response = await PATCH(request as NextRequest, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(response.status).toBe(400);
        });

        // check update response status 500 case
        it('should return 500 if there is an error', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.updateUser).mockRejectedValue(new Error('Database error'));
            const request = new NextRequest('http://localhost/api/auth/users/user-1', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated Name' }),
            });
            // Act
            const response = await PATCH(request as NextRequest, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.updateUser).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });


    // DELETE /api/auth/users/[id] tests
    describe('DELETE /api/auth/users/[id]', () => {
        // check requireSession success case and response 200
        it('should delete user for a valid user and return 200', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.findUserById).mockResolvedValue(makeUser());
            vi.mocked(authRepository.deleteUser).mockResolvedValue();
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-2', { method: 'DELETE' });
            const response = await DELETE(request, { params: Promise.resolve({ id: 'user-2' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.findUserById).toHaveBeenCalledWith('user-2');
            expect(authRepository.deleteUser).toHaveBeenCalledWith('user-2');
            expect(response.status).toBe(200);
        });

        // check requireSession failure case (no token)
        it('should return 401 if not authenticated and it has no auth token', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue(NextResponse.json({ success: false }, { status: 401 }));
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-1', { method: 'DELETE' });
            const response = await DELETE(request, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(response.status).toBe(401);
        });

        // check user not found case response 404
        it('should return 404 if user not found', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.findUserById).mockResolvedValue(undefined);
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/nonexistent-user', { method: 'DELETE' });
            const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent-user' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.findUserById).toHaveBeenCalledWith('nonexistent-user');
            expect(response.status).toBe(404);
        });

        // check self-delete case response 400
        it('should return 400 if user tries to delete their own account', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-1', { method: 'DELETE' });
            const response = await DELETE(request, { params: Promise.resolve({ id: 'user-1' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(response.status).toBe(400);
        });

        // check delete response status 500 case
        it('should return 500 if there is an error', async () => {
            // Arrange
            vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
            vi.mocked(authRepository.findUserById).mockRejectedValue(new Error('Database error'));
            // Act
            const request = new NextRequest('http://localhost/api/auth/users/user-2', { method: 'DELETE' });
            const response = await DELETE(request, { params: Promise.resolve({ id: 'user-2' }) });
            // Assert
            expect(requireSession).toHaveBeenCalled();
            expect(authRepository.findUserById).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });

    });


});
