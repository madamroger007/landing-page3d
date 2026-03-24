import { NextRequest, NextResponse } from 'next/server';
import { authRepository } from '@/src/server/repositories/auth';
import { requireSession } from '@/src/lib/auth/withAuth';
import { updateUserSchema } from '@/src/server/validations/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

function sanitizeUser(user: Awaited<ReturnType<typeof authRepository.findUserById>>) {
    if (!user) return null;
    const {
        password,
        resetPasswordToken,
        resetPasswordExpires,
        ...safe
    } = user;
    void password;
    void resetPasswordToken;
    void resetPasswordExpires;
    return safe;
}

/** GET /api/auth/users/[id] — authenticated (requires cookie session) */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    if (auth.role !== 'admin' && auth.userId !== id) {
        return NextResponse.json(
            { success: false, message: 'Access denied. You can only access your own profile.' },
            { status: 403 }
        );
    }

    const user = await authRepository.findUserById(id);

    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: sanitizeUser(user) });
}

/** PATCH /api/auth/users/[id] — admin only (requires cookie session) */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();

    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(
            { success: false, message: 'Validation failed', errors: validation.error.flatten() },
            { status: 400 }
        );
    }

    const user = await authRepository.updateUser(id, validation.data);
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully', user: sanitizeUser(user) });
}

/** DELETE /api/auth/users/[id] — admin only, cannot self-delete (requires cookie session) */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    if (auth.userId === id) {
        return NextResponse.json({ success: false, message: 'Cannot delete your own account' }, { status: 400 });
    }

    const user = await authRepository.findUserById(id);
    if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    await authRepository.deleteUser(id);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
}
