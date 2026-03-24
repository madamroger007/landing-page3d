import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Error in logout route:', error);
        await reportErrorToSlack(error, { source: "api.logout" });
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
