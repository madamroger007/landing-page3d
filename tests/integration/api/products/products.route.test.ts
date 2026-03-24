import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

vi.mock('@/src/server/services/products', () => ({
    productService: {
        getProducts: vi.fn(),
    },
}));

vi.mock('@/src/lib/auth/withAuth', () => ({
    requireApiTokenRole: vi.fn(),
}));

import { GET, POST } from '@/src/app/api/products/route';
import { productService } from '@/src/server/services/products';
import { requireApiTokenRole } from '@/src/lib/auth/withAuth';

function makeRequest(): NextRequest {
    return {
        formData: vi.fn(),
    } as unknown as NextRequest;
}

describe('products route', () => {
    it('GET returns products', async () => {
        vi.mocked(productService.getProducts).mockResolvedValue([{ id: 1, name: 'A' }] as never);

        const response = await GET();
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ success: true });
    });

    it('POST returns auth response when role check fails', async () => {
        vi.mocked(requireApiTokenRole).mockResolvedValue(NextResponse.json({ success: false }, { status: 403 }));

        const response = await POST(makeRequest());
        expect(response.status).toBe(403);
    });
});
