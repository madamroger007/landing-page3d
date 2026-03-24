import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/src/server/services/auth';
import { forgotPasswordSchema } from '@/src/server/validations/auth';
import { Resend } from 'resend';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * POST /api/email/forget-password
 * Public endpoint — triggered by unauthenticated users who forgot their password.
 * Always returns success to prevent user enumeration.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { email } = validation.data;
        const result = await authService.requestPasswordReset(email);

        if (result.token) {
            const resetLink = `${APP_URL}/dashboard/auth/change-password?token=${result.token}`;

            try {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
                    to: email,
                    subject: 'Reset Your Password',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
                            <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
                                <div style="background:#2563eb;padding:24px;text-align:center;">
                                    <h1 style="color:#fff;margin:0;font-size:24px;">Password Reset</h1>
                                </div>
                                <div style="padding:32px;">
                                    <h2 style="color:#333;margin-top:0;">Reset Your Password</h2>
                                    <p style="color:#666;line-height:1.6;">You requested to reset your password. Click the button below to create a new password:</p>
                                    <div style="text-align:center;margin:32px 0;">
                                        <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Reset Password</a>
                                    </div>
                                    <p style="color:#999;font-size:14px;">This link will expire in <strong>1 hour</strong>.</p>
                                    <p style="color:#999;font-size:14px;">If you didn't request this, please ignore this email.</p>
                                    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
                                    <p style="color:#999;font-size:12px;">Or copy this link: <span style="color:#2563eb;word-break:break-all;">${resetLink}</span></p>
                                </div>
                                <div style="background:#f8f9fa;padding:16px;text-align:center;">
                                    <p style="color:#999;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} MadamSpace. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                });
            } catch (emailError) {
                await reportErrorToSlack(emailError, { source: 'forget-password', route: '/api/email/forget-password', method: 'POST' });
            }
        }

        // Always return success to prevent user enumeration
        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.',
        });
    } catch (error) {
        console.error('Error in forgot-password route:', error);
        await reportErrorToSlack(error, { source: 'forget-password', route: '/api/email/forget-password', method: 'POST' });
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}