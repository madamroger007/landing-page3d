import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/src/server/services/auth';
import { forgotPasswordSchema } from '@/src/server/validations/auth';
import { Resend } from 'resend';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { email } = validation.data;
        const result = await authService.requestPasswordReset(email);

        // Send email if token was generated (user exists)
        if (result.token) {
            const resetLink = `${APP_URL}/dashboard/auth/change-password?token=${result.token}`;

            await resend.emails.send({
                from: process.env.NEXT_PUBLIC_APP_EMAIL || 'mamdamspace@adamstd.my.id',
                to: email,
                subject: 'Reset Your Password',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Reset Your Password</h2>
                        <p>You requested to reset your password. Click the button below to proceed:</p>
                        <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                            Reset Password
                        </a>
                        <p style="color: #666; font-size: 14px;">
                            This link will expire in 1 hour.
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            If you didn't request this, please ignore this email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                        <p style="color: #999; font-size: 12px;">
                            Or copy and paste this link: ${resetLink}
                        </p>
                    </div>
                `,
            });
        }

        // Always return success to prevent user enumeration
        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.',
        });
    } catch (error) {
        console.error('Error in forgot-password route:', error);
        await reportErrorToSlack(error, { source: "api.forgot-password" });
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
