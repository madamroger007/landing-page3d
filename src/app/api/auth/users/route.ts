import { NextRequest, NextResponse } from 'next/server';
import { authRepository } from '@/src/server/repositories/auth';
import { authService } from '@/src/server/services/auth';
import { registerSchema } from '@/src/server/validations/auth';
import { requireSession } from '@/src/lib/auth/withAuth';
import { SelectUser } from '@/src/server/db/schema/user';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

function sanitizeUsers(users: SelectUser[]) {
    return users.map((user) => {
        const { password, resetPasswordToken, resetPasswordExpires, ...rest } = user;
        void password;
        void resetPasswordToken;
        void resetPasswordExpires;
        return rest;
    });
}

/** GET /api/auth/users — admin only (requires cookie session) */
export async function GET() {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    try {
        const users = await authRepository.getUsers();
        return NextResponse.json({ success: true, users: sanitizeUsers(users) });
    } catch (error) {
        console.error('Error in users route:', error);
        await reportErrorToSlack(error, { source: "api.users.get" });
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

/** POST /api/auth/users — admin only (requires cookie session) */
export async function POST(request: NextRequest) {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const result = await authService.registerUser(validation.data);

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json(
            { success: true, message: 'User created successfully', user: result.user },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create user error:', error);
        await reportErrorToSlack(error, { source: "api.users.post" });
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
