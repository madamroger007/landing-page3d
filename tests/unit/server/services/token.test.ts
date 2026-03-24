import { describe, expect, it, vi } from 'vitest';
import type { SelectApiToken } from '@/src/server/db/schema/token';

vi.mock('@/src/server/repositories/token', () => ({
    tokenRepository: {
        createToken: vi.fn(),
        findByTokenHash: vi.fn(),
        findByUserId: vi.fn(),
        deleteToken: vi.fn(),
        deleteAllByUserId: vi.fn(),
    },
}));

import { tokenRepository } from '@/src/server/repositories/token';
import { tokenService } from '@/src/server/services/token';

function makeToken(overrides: Partial<SelectApiToken> = {}): SelectApiToken {
    return {
        id: 'tok-1',
        userId: 'user-1',
        tokenHash: 'hash',
        name: 'Main',
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

describe('tokenService', () => {
    it('generates token and returns safe token view', async () => {
        vi.mocked(tokenRepository.createToken).mockImplementation(async (payload) =>
            makeToken({ tokenHash: payload.tokenHash, userId: payload.userId, name: payload.name })
        );

        const result = await tokenService.generateToken('user-1', 'CI');

        expect(result.raw).toHaveLength(80);
        expect(result.token).toMatchObject({ userId: 'user-1', name: 'CI' });
        expect('tokenHash' in result.token).toBe(false);
    });

    it('invalidates expired tokens on validateToken', async () => {
        vi.mocked(tokenRepository.findByTokenHash).mockResolvedValue(
            makeToken({ expiresAt: new Date(Date.now() - 60_000) })
        );

        const result = await tokenService.validateToken('expired-token');

        expect(result).toBeNull();
        expect(tokenRepository.deleteToken).toHaveBeenCalledWith('tok-1');
    });

    it('revokeToken only revokes owned token', async () => {
        vi.mocked(tokenRepository.findByUserId).mockResolvedValue([makeToken({ id: 'tok-1' })]);

        const owned = await tokenService.revokeToken('tok-1', 'user-1');
        const notOwned = await tokenService.revokeToken('tok-2', 'user-1');

        expect(owned).toBe(true);
        expect(notOwned).toBe(false);
    });

    it('lists tokens without tokenHash', async () => {
        vi.mocked(tokenRepository.findByUserId).mockResolvedValue([makeToken()]);

        const tokens = await tokenService.listTokens('user-1');

        expect(tokens).toHaveLength(1);
        expect('tokenHash' in tokens[0]).toBe(false);
    });
});
