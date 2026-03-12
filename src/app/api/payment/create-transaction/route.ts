import { NextRequest, NextResponse } from 'next/server';
import { Item, MidtransTransaction } from '@/src/types/type';
import { requireApiToken } from '@/src/lib/auth/withAuth';
import { ordersRepository } from '@/src/server/repositories/orders';

const MIDTRANS_API_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

/** POST /api/payment/create-transaction — requires Bearer token */
export async function POST(req: NextRequest) {
    const auth = await requireApiToken(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body: MidtransTransaction = await req.json();
        const { order_id, gross_amount, items, customer } = body;

        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey) {
            return NextResponse.json({ error: 'Midtrans server key not configured' }, { status: 500 });
        }

        const credentials = Buffer.from(`${serverKey}:`).toString('base64');

        const midtransRes = await fetch(MIDTRANS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${credentials}`,
            },
            body: JSON.stringify({
                transaction_details: { order_id, gross_amount },
                item_details: items.map((item: Item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image ?? '/nft-card-1.png',
                    price: item.price,
                    quantity: item.quantity,
                })),
                customer_details: customer
                    ? {
                        name: customer.name ?? 'Customer',
                        email: customer.email ?? 'customer@example.com',
                        phone: customer.phone ?? '081234567890',
                    }
                    : undefined,
            }),
        });

        if (!midtransRes.ok) {
            const errBody = await midtransRes.text();
            console.error('[Midtrans API error]', errBody);
            return NextResponse.json(
                { error: 'Midtrans transaction failed', detail: errBody },
                { status: midtransRes.status }
            );
        }

        const data = await midtransRes.json();

        // Save order to database
        try {
            await ordersRepository.createOrder({
                orderId: order_id,
                grossAmount: gross_amount,
                snapToken: data.token,
                items: JSON.stringify(items),
                customerName: customer?.name,
                customerEmail: customer?.email,
                customerPhone: customer?.phone,
                transactionStatus: 'pending',
            });
        } catch (dbError) {
            console.error('[create-transaction] Failed to save order:', dbError);
            // Continue even if DB save fails - transaction was created in Midtrans
        }

        return NextResponse.json({ snap_token: data.token });
    } catch (err) {
        console.error('[create-transaction]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
