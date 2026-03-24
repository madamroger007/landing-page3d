import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/src/server/services/auth';
import { loginSchema } from '@/src/server/validations/auth';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;
        const result = await authService.loginUser(email, password);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 401 }
            );
        }

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set('auth-token', result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({
            success: true,
            message: result.message,
            user: result.user,
        });
    } catch (error) {
        console.error('Error in login route:', error);
        await reportErrorToSlack(error, { source: "api.login" });
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
