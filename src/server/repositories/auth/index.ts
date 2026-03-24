import { eq, gt, and } from 'drizzle-orm';
import { createHash } from 'crypto';
import { db } from '@/src/server/db';
import { usersTable, InsertUser, SelectUser } from '@/src/server/db/schema/user';

function hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export const authRepository = {
    /**
     * Find user by email
     */
    async findUserByEmail(email: string): Promise<SelectUser | undefined> {
        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);
        return user;
    },

    /**
     * Find user by ID
     */
    async findUserById(id: string): Promise<SelectUser | undefined> {
        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);
        return user;
    },

    /**
     * Find user by valid reset token (not expired)
     */
    async findUserByResetToken(token: string): Promise<SelectUser | undefined> {
        const tokenHash = hashResetToken(token);

        const [user] = await db
            .select()
            .from(usersTable)
            .where(
                and(
                    eq(usersTable.resetPasswordToken, tokenHash),
                    gt(usersTable.resetPasswordExpires, new Date())
                )
            )
            .limit(1);
        return user;
    },

    /**
     * Create a new user
     */
    async createUser(data: InsertUser): Promise<SelectUser> {
        const [user] = await db
            .insert(usersTable)
            .values(data)
            .returning();
        return user;
    },

    /**
     * Update user password
     */
    async updateUserPassword(id: string, hashedPassword: string): Promise<SelectUser | undefined> {
        const [user] = await db
            .update(usersTable)
            .set({
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                updatedAt: new Date(),
            })
            .where(eq(usersTable.id, id))
            .returning();
        return user;
    },

    /**
     * Set reset token for password recovery
     */
    async setResetToken(
        email: string,
        token: string,
        expires: Date
    ): Promise<SelectUser | undefined> {
        const tokenHash = hashResetToken(token);

        const [user] = await db
            .update(usersTable)
            .set({
                resetPasswordToken: tokenHash,
                resetPasswordExpires: expires,
                updatedAt: new Date(),
            })
            .where(eq(usersTable.email, email))
            .returning();
        return user;
    },

    /**
     * Clear reset token after password change
     */
    async clearResetToken(id: string): Promise<void> {
        await db
            .update(usersTable)
            .set({
                resetPasswordToken: null,
                resetPasswordExpires: null,
                updatedAt: new Date(),
            })
            .where(eq(usersTable.id, id));
    },

    /**
     * Get all users
     */
    async getUsers(): Promise<SelectUser[]> {
        return db.select().from(usersTable);
    },

    /**
     * Update user
     */
    async updateUser(
        id: string,
        data: Partial<Pick<InsertUser, 'name' | 'email' | 'role'>>
    ): Promise<SelectUser | undefined> {
        const [user] = await db
            .update(usersTable)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(usersTable.id, id))
            .returning();
        return user;
    },

    /**
     * Delete user
     */
    async deleteUser(id: string): Promise<void> {
        await db.delete(usersTable).where(eq(usersTable.id, id));
    },
};

export type AuthRepository = typeof authRepository;
