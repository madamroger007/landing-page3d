import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/src/server/services/products';
import { categorySchema } from '@/src/server/validations/products';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/** GET /api/products/categories/[id] — public, get single category */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const category = await productService.getCategoryById(Number(id));

        if (!category) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, category }, { status: 200 });
    } catch (error) {
        console.error('Get category error:', error);
        await reportErrorToSlack(error, { source: 'get-category', route: '/api/products/categories/[id]', method: 'GET' });
        return NextResponse.json(
            { success: false, message: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

/** PATCH /api/products/categories/[id] — admin only (Bearer token), update category */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        const body = await request.json();
        const validation = categorySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const result = await productService.updateCategory(Number(id), validation.data);

        if (result === null) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
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
            { success: true, message: 'Category updated successfully', category: result },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update category error:', error);
        await reportErrorToSlack(error, { source: 'update-category', route: '/api/products/categories/[id]', method: 'PATCH' });
        return NextResponse.json(
            { success: false, message: 'Failed to update category' },
            { status: 500 }
        );
    }
}

/** DELETE /api/products/categories/[id] — admin only (Bearer token), delete category */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        const deleted = await productService.deleteCategory(Number(id));

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Category deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete category error:', error);
        await reportErrorToSlack(error, { source: 'delete-category', route: '/api/products/categories/[id]', method: 'DELETE' });
        return NextResponse.json(
            { success: false, message: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
