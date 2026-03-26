import { DELETE } from '@/src/app/api/auth/token/[id]/route';
import { requireSession } from '@/src/lib/auth/withAuth';
import { tokenService } from '@/src/server/services/token';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireSession: vi.fn(),
}));

vi.mock('@/src/server/services/token', () => ({
    tokenService: {
        revokeToken: vi.fn(),
    },
}));

// Delete /api/auth/token/[id] route tests
describe('DELETE /api/auth/token/[id]', () => {
    it('should revoke a token successfully', async () => {
        // Arrange
        const tokenId = 'token-1';
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.revokeToken).mockResolvedValue(true);
        const paramsPromise = Promise.resolve({ id: tokenId });
        // Act
        const request = new NextRequest(`http://localhost/api/auth/token/${tokenId}`, { method: 'DELETE' });
        const response = await DELETE(request, { params: paramsPromise });
        // Assert
        expect(response.status).toBe(200);
        expect(requireSession).toHaveBeenCalled();
        expect(tokenService.revokeToken).toHaveBeenCalledWith(tokenId, 'user-1');
    });

    it('should return 404 if token not found or does not belong to user', async () => {
        // Arrange
        const tokenId = 'token-1';
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.revokeToken).mockResolvedValue(false);
        const paramsPromise = Promise.resolve({ id: tokenId });
        // Act
        const request = new NextRequest(`http://localhost/api/auth/token/${tokenId}`, { method: 'DELETE' });
        const response = await DELETE(request, { params: paramsPromise });
        // Assert
        expect(response.status).toBe(404);
        expect(requireSession).toHaveBeenCalled();
        expect(tokenService.revokeToken).toHaveBeenCalledWith(tokenId, 'user-1');
    });

    it('should return 500 on internal server error', async () => {
        // Arrange
        const tokenId = 'token-1';
        vi.mocked(requireSession).mockResolvedValue({ userId: 'user-1', role: 'admin' });
        vi.mocked(tokenService.revokeToken).mockRejectedValue(new Error('Database error'));
        const paramsPromise = Promise.resolve({ id: tokenId });
        // Act
        const request = new NextRequest(`http://localhost/api/auth/token/${tokenId}`, { method: 'DELETE' });
        const response = await DELETE(request, { params: paramsPromise });
        // Assert
        expect(response.status).toBe(500);
        expect(requireSession).toHaveBeenCalled();
        expect(tokenService.revokeToken).toHaveBeenCalledWith(tokenId, 'user-1');
    });
})