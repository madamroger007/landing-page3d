import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/src/server/services/products';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/** POST /api/products/[id]/like — public, increment like count */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const product = await productService.likeProduct(Number(id));

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Product liked', likes: product.likes },
            { status: 200 }
        );
    } catch (error) {
        console.error('Like product error:', error);
        await reportErrorToSlack(error, { source: 'like-product', route: '/api/products/[id]/like', method: 'POST' });
        return NextResponse.json(
            { success: false, message: 'Failed to like product' },
            { status: 500 }
        );
    }
}
