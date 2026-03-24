import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/src/server/services/products';
import { reportErrorToSlack } from '@/src/server/lib/slack-error-reporter';

/** GET /api/products/search?q=query — public, search products */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        const products = await productService.searchProducts(query);

        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
        console.error('Search products error:', error);
        await reportErrorToSlack(error, { source: 'search-products', route: '/api/products/search', method: 'GET' });
        return NextResponse.json(
            { success: false, message: 'Failed to search products' },
            { status: 500 }
        );
    }
}
