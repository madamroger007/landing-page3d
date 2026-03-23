'use server';

export async function deleteInvoices(orderId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/orders?order_id=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
        }
    });

    return response.json();
}

export async function getAllInvoices() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/orders`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
        }
    });

    return response.json();
}


export async function getInvoiceByOrderId(orderId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/orders?order_id=${encodeURIComponent(orderId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        },
        cache: 'no-store',
        
    });

    return response.json();
}

