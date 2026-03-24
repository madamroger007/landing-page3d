import { NextRequest, NextResponse } from 'next/server';
import { tokenService } from '@/src/server/services/token';
import { requireSession } from '@/src/lib/auth/withAuth';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/** DELETE /api/auth/token/[id] — revoke a single token by ID (requires cookie session) */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireSession();
        if (auth instanceof NextResponse) return auth;

        const { id } = await params;
        const revoked = await tokenService.revokeToken(id, auth.userId);

        if (!revoked) {
            return NextResponse.json(
                { success: false, message: 'Token not found or does not belong to you' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Token revoked' });
    } catch (error) {
        console.error('Error in token delete route:', error);
        await reportErrorToSlack(error, { source: "api.token.delete" });
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
