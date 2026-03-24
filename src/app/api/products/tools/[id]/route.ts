import { NextRequest, NextResponse } from 'next/server';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';
import { toolSchema } from '@/src/server/validations/tools';
import { toolService } from '@/src/server/services/tools';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const tool = await toolService.getToolById(Number(id));

        if (!tool) {
            return NextResponse.json(
                { success: false, message: 'Tool not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, tool }, { status: 200 });
    } catch (error) {
        console.error('Get tool error:', error);
        await reportErrorToSlack(error, { source: 'get-tool', route: '/api/products/tools/[id]', method: 'GET' });
        return NextResponse.json(
            { success: false, message: 'Failed to fetch tool' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        const body = await request.json();
        const validation = toolSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const result = await toolService.updateTool(Number(id), validation.data);

        if (result === null) {
            return NextResponse.json(
                { success: false, message: 'Tool not found' },
                { status: 404 }
            );
        }

        if ('error' in result) {
            return NextResponse.json(
                { success: false, message: result.error },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Tool updated successfully', tool: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update tool error:', error);
        await reportErrorToSlack(error, { source: 'update-tool', route: '/api/products/tools/[id]', method: 'PATCH' });
        return NextResponse.json(
            { success: false, message: 'Failed to update tool' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        const deleted = await toolService.deleteTool(Number(id));

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: 'Tool not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Tool deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete tool error:', error);
        await reportErrorToSlack(error, { source: 'delete-tool', route: '/api/products/tools/[id]', method: 'DELETE' });

        return NextResponse.json(
            { success: false, message: 'Failed to delete tool' },
            { status: 500 }
        );
    }
}
