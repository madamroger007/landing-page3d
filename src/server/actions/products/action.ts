'use server';

// ─── Helper ──────────────────────────────────────────────────────────────────

function buildProductFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) return;
        if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
            return;
        }
        if (value instanceof File) {
            formData.append(key, value);
        } else {
            formData.append(key, String(value ?? ''));
        }
    });
    return formData;
}

// ─── Products Server Actions ─────────────────────────────────────────────────

export async function getProductById(productId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${productId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}

export async function createProductAction(data: {
    name: string;
    price: number;
    description: string;
    image?: string | null;
    videoUrl?: string | null;
    category?: string | null;
    toolIds?: number[];
    file?: File | null;
}) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: buildProductFormData(data),
    });

    return response.json();
}

export async function updateProductAction(
    productId: number,
    data: {
        name?: string;
        price?: number;
        description?: string;
        image?: string | null;
        videoUrl?: string | null;
        category?: string | null;
        toolIds?: number[];
        file?: File | null;
        oldImageUrl?: string | null;
    }
) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: buildProductFormData(data),
    });

    return response.json();
}

export async function deleteProduct(productId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}

export async function getProducts() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });
    return response.json();
}

export async function getProductsByCategory(category: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products?category=${category}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}


// ─── Categories Server Actions ───────────────────────────────────────────────

export async function getCategories() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/categories`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}

// ─── Categories Server Actions ───────────────────────────────────────────────

export async function createCategory(formData: { name: string }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
    });

    return response.json();
}

export async function updateCategory(categoryId: number, formData: { name: string }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
    });

    return response.json();
}

export async function deleteCategory(categoryId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}

// ─── Tools Server Actions ───────────────────────────────────────────────────

export async function getTools() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/tools`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}

export async function createTool(formData: { name: string }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/tools`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
    });

    return response.json();
}

export async function updateTool(toolId: number, formData: { name: string }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/tools/${toolId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        body: JSON.stringify(formData),
    });

    return response.json();
}

export async function deleteTool(toolId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/tools/${toolId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
    });

    return response.json();
}
