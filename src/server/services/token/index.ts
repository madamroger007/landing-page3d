import { createHash, randomBytes } from 'crypto';
import { tokenRepository } from '@/src/server/repositories/token';
import { SelectApiToken } from '@/src/server/db/schema/token';

/** Safe public view of a token (never exposes tokenHash) */
export type TokenView = Omit<SelectApiToken, 'tokenHash'>;

/** What validateToken returns on success */
export interface TokenValidation {
    tokenId: string;
    userId: string;
}

function hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
}

export const tokenService = {
    /**
     * Generate a new opaque API token, store it hashed, return the raw value once.
     */
    async generateToken(
        userId: string,
        name: string,
        expiresAt?: Date
    ): Promise<{ raw: string; token: TokenView }> {
        const raw = randomBytes(40).toString('hex'); // 80-char hex string
        const tokenHash = hashToken(raw);

        const created = await tokenRepository.createToken({
            userId,
            tokenHash,
            name,
            expiresAt: expiresAt ?? null,
        });

        const { tokenHash: hiddenHash, ...view } = created;
        void hiddenHash;
        return { raw, token: view };
    },

    /**
     * Validate a raw Bearer token — returns tokenId & userId on success, null otherwise.
     */
    async validateToken(rawToken: string): Promise<TokenValidation | null> {
        const tokenHash = hashToken(rawToken);
        const record = await tokenRepository.findByTokenHash(tokenHash);

        if (!record) return null;

        // Check expiry
        if (record.expiresAt && record.expiresAt < new Date()) {
            // Cleanup expired token
            await tokenRepository.deleteToken(record.id);
            return null;
        }

        return { tokenId: record.id, userId: record.userId };
    },

    /**
     * Revoke a single token (only if it belongs to the requesting user).
     */
    async revokeToken(id: string, userId: string): Promise<boolean> {
        const tokens = await tokenRepository.findByUserId(userId);
        const owns = tokens.some((t) => t.id === id);
        if (!owns) return false;
        await tokenRepository.deleteToken(id);
        return true;
    },

    /**
     * Revoke all tokens for a user.
     */
    async revokeAllTokens(userId: string): Promise<void> {
        await tokenRepository.deleteAllByUserId(userId);
    },

    /**
     * List all tokens for a user (safe view, no hash).
     */
    async listTokens(userId: string): Promise<TokenView[]> {
        const tokens = await tokenRepository.findByUserId(userId);
        return tokens.map((token) => {
            const { tokenHash: hiddenHash, ...view } = token;
            void hiddenHash;
            return view;
        });
    },
};

export type TokenService = typeof tokenService;
