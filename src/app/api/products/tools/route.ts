import { NextRequest, NextResponse } from 'next/server';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';
import { toolSchema } from '@/src/server/validations/tools';
import { toolService } from '@/src/server/services/tools';

export async function GET() {
    try {
        const tools = await toolService.getTools();
        return NextResponse.json({ success: true, tools }, { status: 200 });
    } catch (error) {
        console.error('Get tools error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch tools' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const validation = toolSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const result = await toolService.createTool(validation.data);
        if ('error' in result) {
            return NextResponse.json(
                { success: false, message: result.error },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Tool created successfully', tool: result },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create tool error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create tool' },
            { status: 500 }
        );
    }
}
