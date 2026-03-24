import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/src/server/services/auth';
import { resetPasswordSchema } from '@/src/server/validations/auth';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = resetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { token, password } = validation.data;
        const result = await authService.resetPassword(token, password);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        await reportErrorToSlack(error, { source: "api.reset-password.post" });
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Validate token endpoint
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, valid: false, message: 'Token is required' },
                { status: 400 }
            );
        }

        const result = await authService.validateResetToken(token);

        return NextResponse.json({
            success: true,
            valid: result.valid,
        });
    } catch (error) {
        console.error('Error in reset-password GET route:', error);
        await reportErrorToSlack(error, { source: "api.reset-password.get" });
        return NextResponse.json(
            { success: false, valid: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
