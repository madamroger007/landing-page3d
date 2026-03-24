import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';
import { authRepository } from '@/src/server/repositories/auth';
import { InsertUser, SelectUser } from '@/src/server/db/schema/user';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('Missing JWT_SECRET environment variable. Refusing to start with an insecure JWT configuration.');
}

const JWT_SECRET = new TextEncoder().encode(jwtSecret);
const TOKEN_EXPIRY = '7d';
const RESET_TOKEN_EXPIRY_HOURS = 1;

export interface AuthResult {
    success: boolean;
    message: string;
    user?: Omit<SelectUser, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'>;
    token?: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Sanitize user object - remove sensitive fields
 */
function sanitizeUser(user: SelectUser) {
    const {
        password,
        resetPasswordToken,
        resetPasswordExpires,
        ...sanitized
    } = user;
    void password;
    void resetPasswordToken;
    void resetPasswordExpires;
    return sanitized;
}

export const authService = {
    /**
     * Hash password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    },

    /**
     * Compare password with hash
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    },

    /**
     * Generate JWT token
     */
    async generateToken(payload: TokenPayload): Promise<string> {
        return new SignJWT({ ...payload } as Record<string, unknown>)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(TOKEN_EXPIRY)
            .sign(JWT_SECRET);
    },

    /**
     * Verify JWT token
     */
    async verifyToken(token: string): Promise<TokenPayload | null> {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            return payload as unknown as TokenPayload;
        } catch {
            return null;
        }
    },

    /**
     * Generate random reset token
     */
    generateResetToken(): string {
        return randomBytes(32).toString('hex');
    },

    /**
     * Login user
     */
    async loginUser(email: string, password: string): Promise<AuthResult> {
        const user = await authRepository.findUserByEmail(email);

        if (!user) {
            return {
                success: false,
                message: 'Invalid email or password',
            };
        }

        const isValidPassword = await this.comparePassword(password, user.password);

        if (!isValidPassword) {
            return {
                success: false,
                message: 'Invalid email or password',
            };
        }

        const token = await this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            success: true,
            message: 'Login successful',
            user: sanitizeUser(user),
            token,
        };
    },

    /**
     * Register new user
     */
    async registerUser(
        data: Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt' | 'resetPasswordToken' | 'resetPasswordExpires'>
    ): Promise<AuthResult> {
        const existingUser = await authRepository.findUserByEmail(data.email);

        if (existingUser) {
            return {
                success: false,
                message: 'Email already registered',
            };
        }

        const hashedPassword = await this.hashPassword(data.password);

        const user = await authRepository.createUser({
            ...data,
            password: hashedPassword,
        });

        return {
            success: true,
            message: 'User registered successfully',
            user: sanitizeUser(user),
        };
    },

    /**
     * Request password reset - generates token and returns it
     * Note: Always returns success to prevent user enumeration
     */
    async requestPasswordReset(email: string): Promise<{ success: boolean; token?: string }> {
        const user = await authRepository.findUserByEmail(email);

        // Always return success to prevent user enumeration
        if (!user) {
            return { success: true };
        }

        const resetToken = this.generateResetToken();
        const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

        await authRepository.setResetToken(email, resetToken, expires);

        return {
            success: true,
            token: resetToken,
        };
    },

    /**
     * Validate reset token
     */
    async validateResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
        const user = await authRepository.findUserByResetToken(token);

        if (!user) {
            return { valid: false };
        }

        return {
            valid: true,
            userId: user.id,
        };
    },

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
        const user = await authRepository.findUserByResetToken(token);

        if (!user) {
            return {
                success: false,
                message: 'Invalid or expired reset token',
            };
        }

        const hashedPassword = await this.hashPassword(newPassword);
        await authRepository.updateUserPassword(user.id, hashedPassword);

        return {
            success: true,
            message: 'Password reset successfully',
        };
    },

    /**
     * Get current user from token
     */
    async getCurrentUser(id: string): Promise<AuthResult> {

        const user = await authRepository.findUserById(id);

        if (!user) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        return {
            success: true,
            message: 'User found',
            user: sanitizeUser(user),
        };
    },
};

export type AuthService = typeof authService;
