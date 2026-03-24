import { NextRequest, NextResponse } from 'next/server';
import { tokenService } from '@/src/server/services/token';
import { requireSession } from '@/src/lib/auth/withAuth';

/** GET /api/auth/token — list own tokens (requires cookie session) */
export async function GET(request: NextRequest) {
    void request;

    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const tokens = await tokenService.listTokens(auth.userId);
    return NextResponse.json({ success: true, tokens }, { status: 200 });
}

/** POST /api/auth/token — generate a new API token (requires cookie session) */
export async function POST(request: NextRequest) {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const name: string = body?.name?.trim() || 'Default Token';

        const expiresAt: Date | undefined = body?.expiresAt
            ? new Date(body.expiresAt)
            : undefined;

        const { raw, token } = await tokenService.generateToken(
            auth.userId,
            name,
            expiresAt
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Token generated. Copy it now — it will not be shown again.',
                token: raw,
                meta: token,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Generate token error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/** DELETE /api/auth/token — revoke ALL own tokens (requires cookie session) */
export async function DELETE(request: NextRequest) {
    void request;

    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await tokenService.revokeAllTokens(auth.userId);
    return NextResponse.json({ success: true, message: 'All tokens revoked' });
}
