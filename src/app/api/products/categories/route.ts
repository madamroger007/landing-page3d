import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/src/server/services/products';
import { categorySchema } from '@/src/server/validations/products';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';

/** GET /api/products/categories — public, list all categories */
export async function GET() {
    try {
        const categories = await productService.getCategories();
        return NextResponse.json({ success: true, categories:categories }, { status: 200 });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

/** POST /api/products/categories — admin only (Bearer token), create category */
export async function POST(request: NextRequest) {
    const auth = await requireApiTokenRole(request, 'admin');
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await request.json();
        const validation = categorySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const result = await productService.createCategory(validation.data);

        if ('error' in result) {
            return NextResponse.json(
                { success: false, message: result.error },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Category created successfully', category: result },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create category' },
            { status: 500 }
        );
    }
}
