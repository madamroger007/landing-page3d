import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/src/server/services/auth';
import { tokenService } from '@/src/server/services/token';
import { authRepository } from '@/src/server/repositories/auth';

export interface AuthContext {
    userId: string;
    role: string;
}

// ============================================================================
// SESSION-BASED AUTHENTICATION (Cookie JWT)
// Used by: /api/auth/* routes (dashboard session)
// ============================================================================

export async function requireSession(): Promise<AuthContext | NextResponse> {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('auth-token')?.value;

    if (!jwtToken) {
        return NextResponse.json(
            { success: false, message: 'Not authenticated. Session required.' },
            { status: 401 }
        );
    }

    const payload = await authService.verifyToken(jwtToken);

    if (!payload) {
        return NextResponse.json(
            { success: false, message: 'Invalid or expired session token' },
            { status: 401 }
        );
    }

    return { userId: payload.userId, role: payload.role };
}

export async function requireSessionRole(
    role: string
): Promise<AuthContext | NextResponse> {
    const result = await requireSession();
    if (result instanceof NextResponse) return result;

    if (result.role !== role) {
        return NextResponse.json(
            { success: false, message: `Access denied. ${role} role required.` },
            { status: 403 }
        );
    }

    return result;
}

// ============================================================================
// API TOKEN AUTHENTICATION (Bearer Token)
// Used by: /api/email/*, /api/payment/*, /api/voucher/* (external APIs)
// ============================================================================

export async function requireApiToken(
    request: NextRequest
): Promise<AuthContext | NextResponse> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
            { success: false, message: 'Not authenticated. Bearer token required.' },
            { status: 401 }
        );
    }

    const raw = authHeader.slice(7).trim();
    if (!raw) {
        return NextResponse.json(
            { success: false, message: 'Empty bearer token' },
            { status: 401 }
        );
    }

    const validation = await tokenService.validateToken(raw);
    if (!validation) {
        return NextResponse.json(
            { success: false, message: 'Invalid or expired bearer token' },
            { status: 401 }
        );
    }

    // Fetch user to get role
    const user = await authRepository.findUserById(validation.userId);
    if (!user) {
        return NextResponse.json(
            { success: false, message: 'User not found' },
            { status: 401 }
        );
    }

    return { userId: user.id, role: user.role };
}

export async function requireApiTokenRole(
    request: NextRequest,
    role: string
): Promise<AuthContext | NextResponse> {
    const result = await requireApiToken(request);
    if (result instanceof NextResponse) return result;

    if (result.role !== role) {
        return NextResponse.json(
            { success: false, message: `Access denied. ${role} role required.` },
            { status: 403 }
        );
    }

    return result;
}

// ============================================================================
// LEGACY/FLEXIBLE AUTHENTICATION (Deprecated)
// Accepts both Bearer token and Cookie session — use specific guards instead
// ============================================================================

export async function requireAuth(
    request: NextRequest
): Promise<AuthContext | NextResponse> {
    // 1. Try Bearer header first
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return requireApiToken(request);
    }

    // 2. Fallback: cookie-based JWT session
    return requireSession();
}

export async function requireRole(
    request: NextRequest,
    role: string
): Promise<AuthContext | NextResponse> {
    const result = await requireAuth(request);

    // If it's already a NextResponse (error), pass it through
    if (result instanceof NextResponse) return result;

    if (result.role !== role) {
        return NextResponse.json(
            { success: false, message: `Access denied. ${role} role required.` },
            { status: 403 }
        );
    }

    return result;
}
