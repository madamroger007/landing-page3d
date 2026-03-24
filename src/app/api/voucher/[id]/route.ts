import { NextRequest, NextResponse } from 'next/server';
import {
    getVoucherByIdService,
    updateVoucherService,
    deleteVoucherService,
} from '@/src/server/services/voucher';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/** GET /api/voucher/[id] — public */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const voucher = await getVoucherByIdService(Number(id));
        if (!voucher) {
            return NextResponse.json({ success: false, message: 'Voucher not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: voucher }, { status: 200 });
    } catch(error) {
        console.error('Get voucher error:', error);
        await reportErrorToSlack(error, { source: 'get-voucher', route: '/api/voucher/[id]', method: 'GET' });
        return NextResponse.json({ success: false, message: 'Failed to get voucher' }, { status: 500 });
    }
}

/** PATCH /api/voucher/[id] — admin only (requires Bearer token) */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        const body = await request.json();
        await updateVoucherService({ id: Number(id), ...body });
        return NextResponse.json({ success: true, message: 'Voucher updated' });
    } catch (error) {
        console.error('Update voucher error:', error);
        await reportErrorToSlack(error, { source: 'update-voucher', route: '/api/voucher/[id]', method: 'PATCH' });

        return NextResponse.json({ success: false, message: 'Failed to update voucher' }, { status: 500 });
    }
}

/** DELETE /api/voucher/[id] — admin only (requires Bearer token) */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await deleteVoucherService(Number(id));
        return NextResponse.json({ success: true, message: 'Voucher deleted' });
    } catch (error) {
        console.error('Delete voucher error:', error);
        await reportErrorToSlack(error, { source: 'delete-voucher', route: '/api/voucher/[id]', method: 'DELETE' });
        return NextResponse.json({ success: false, message: 'Failed to delete voucher' }, { status: 500 });
    }
}