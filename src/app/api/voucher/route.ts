import { NextRequest, NextResponse } from 'next/server';
import { createVoucherService, getVouchersService } from '@/src/server/services/voucher';
import { voucherSchema } from '@/src/server/validations/voucher';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';

/** GET /api/voucher — public */
export async function GET() {
    try {
        const vouchers = await getVouchersService();
        return NextResponse.json({ vouchers }, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

/** POST /api/voucher — admin only (requires Bearer token) */
export async function POST(request: NextRequest) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const validation = voucherSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const voucher = await createVoucherService(validation.data);
        return NextResponse.json({ success: true, voucher }, { status: 201 });
    } catch (error) {
        console.error('Create voucher error:', error);
        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}