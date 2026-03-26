import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import type { TokenView } from '@/src/server/services/token';
import { DELETE, GET, POST } from '@/src/app/api/auth/token/route';
import { requireSession } from '@/src/lib/auth/withAuth';
import { tokenService } from '@/src/server/services/token';
import { randomBytes } from 'crypto';

// Mock dependencies
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

describe('GET Auth token route /api/auth/token', () => {
    // check requireSession success case and response 200
    it('should return a list of tokens for a valid user', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.listTokens).mockResolvedValue([makeTokenView()]);
        // Act
        const response = await GET();
        // Assert
        expect(response.status).toBe(200);
        expect(tokenService.listTokens).toHaveBeenCalledWith('user-1');
        await expect(response.json()).resolves.toEqual({
            success: true,
            tokens: [{
                id: 't1',
                userId: 'user-1',
                name: 'ci',
                expiresAt: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            }],

        });
    });
    // check that tokenService.listTokens is called with correct userId
    it('should call tokenService.listTokens with correct userId', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        // Act
        await GET();
        // Assert
        expect(tokenService.listTokens).toHaveBeenCalledWith('user-1');
        expect(tokenService.listTokens).toHaveBeenCalledTimes(1);
    });
    // check requireSession auth not found case and response 400
    it('should return 401 if user is not authenticated', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue(new NextResponse('Unauthorized', { status: 401 }));
        // Act
        const response = await GET();
        // Assert
        expect(response.status).toBe(401);
        expect(tokenService.listTokens).not.toHaveBeenCalled();
    });
    // check requireSession failure case and response 500
    it('should return 500 if there is a server error', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.listTokens).mockRejectedValue(new Error('Server error'));
        // Act
        const response = await GET();
        // Assert
        expect(response.status).toBe(500);
        expect(tokenService.listTokens).toHaveBeenCalledWith('user-1');
    });
});

// POST auth token route tests
describe('POST Auth token route /api/auth/token', () => {
    // check requireSession success case and response 201
    it('should generate a new token for a valid user', async () => {
        // Arrange
        const newToken = {
            raw: randomBytes(40).toString('hex'),
            token: makeTokenView(),
        };
        const payload = { name: 'ci' };
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.generateToken).mockResolvedValue(newToken);
        // Act
        const request = new NextRequest('http://localhost/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const response = await POST(request as NextRequest);
        // Assert
        expect(response.status).toBe(201);
        expect(tokenService.generateToken).toHaveBeenCalledWith('user-1', 'ci', undefined);
        await expect(response.json()).resolves.toEqual({
            success: true,
            message: 'Token generated. Copy it now — it will not be shown again.',
            token: newToken.raw,
            meta: {
                id: 't1',
                userId: 'user-1',
                name: 'ci',
                expiresAt: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            },
        });
    });


    // check token expiresAt not undefined case and response 201
    it('should generate a new token with expiresAt for a valid user', async () => {
        // Arrange
        const newToken = {
            raw: randomBytes(40).toString('hex'),
            token: {
                id: 't1',
                userId: 'user-1',
                name: 'ci',
                expiresAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };
        const payload = { name: 'ci', expiresAt: new Date() };
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.generateToken).mockResolvedValue(newToken);
        // Act
        const request = new NextRequest('http://localhost/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const response = await POST(request as NextRequest);
        // Assert
        expect(response.status).toBe(201);
        expect(tokenService.generateToken).toHaveBeenCalled();
        await expect(response.json()).resolves.toEqual({
            success: true,
            message: 'Token generated. Copy it now — it will not be shown again.',
            token: newToken.raw,
            meta: {
                id: newToken.token.id,
                userId: newToken.token.userId,
                name: newToken.token.name,
                expiresAt: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            },
        });

    });

    // check requireSession auth not found case and response 400
    it('should return 401 if user is not authenticated', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue(new NextResponse('Unauthorized', { status: 401 }));
        // Act
        const response = await POST(new Request('http://localhost/api/auth/token') as NextRequest);
        // Assert
        expect(response.status).toBe(401);
        expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    // check requireSession failure case and response 500
    it('should return 500 if there is a server error', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.generateToken).mockRejectedValue(new Error('Server error'));
        // Act
        const response = await POST(new NextRequest('http://localhost/api/auth/token') as NextRequest);
        // Assert
        expect(requireSession).toHaveBeenCalled();
        expect(response.status).toBe(500);
        expect(tokenService.generateToken).not.toHaveBeenCalled();
    });
});


// DELETE /api/auth/token route tests are in token/[id]/route.test.ts since the delete by id logic is there, and the delete all tokens logic is just a call to the revokeAllTokens service method without much logic in the route handler.
describe('DELETE Auth token route /api/auth/token', () => {
    // check requireSession success case and response 200
    it('should revoke all tokens for a valid user', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        // Act
        const response = await DELETE();
        // Assert
        expect(response.status).toBe(200);
        expect(tokenService.revokeAllTokens).toHaveBeenCalled();
    });

    // check requireSession auth not found case and response 400
    it('should return 401 if user is not authenticated', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue(new NextResponse('Unauthorized', { status: 401 }));
        // Act
        const response = await DELETE();
        // Assert
        expect(response.status).toBe(401);
        expect(tokenService.revokeAllTokens).not.toHaveBeenCalled();
    });

    // check requireSession failure case and response 500
    it('should return 500 if there is a server error', async () => {
        // Arrange
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.revokeAllTokens).mockRejectedValue(new Error('Server error'));
        // Act
        const response = await DELETE();
        // Assert
        expect(requireSession).toHaveBeenCalled();
        expect(response.status).toBe(500);
        expect(tokenService.revokeAllTokens).toHaveBeenCalled();
    });
});