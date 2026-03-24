import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/src/server/services/auth';
import { requireSession } from '@/src/lib/auth/withAuth';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

/** GET /api/auth/me — requires cookie session (dashboard) */
export async function GET(request: NextRequest) {
    void request;

    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    try {
        const result = await authService.getCurrentUser(auth.userId);

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 401 });
        }

        return NextResponse.json({ success: true, user: result.user });
    } catch (error) {
        console.error('Error in me route:', error);
        await reportErrorToSlack(error, { source: "api.me" });
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
