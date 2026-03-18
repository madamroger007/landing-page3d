import { Resend } from 'resend';
import { EmailTemplate } from '@/src/components/email/ConfirmationPayment';
import DirectPayment from '@/src/components/email/Directpayment';
import { Item } from '@/src/types/type';

type BodyProps = {
    email: string;
    name: string;
    order_id: string;
    items: string | null |undefined;
    total: number;
}
const resend = new Resend(process.env.RESEND_API_KEY);
const ItemParse = (items: string | null | undefined): Item[] => {
    if (!items) return [];
    if (typeof items === "string") {
        try {
            const parsed = JSON.parse(items);
            if (Array.isArray(parsed)) {
                return parsed as Item[];
            }
        } catch (e) {
            console.error("Failed to parse items:", e);
            return [];
        }
    }
    return items as unknown as Item[];
}
export async function SendConfirmationEmail(body: BodyProps) {
    const { items } = body;
    const parsedItems: Item[] = ItemParse(items);
    const { data, error } = await resend.emails.send({
        from: `MadamSpace <${process.env.NEXT_PUBLIC_APP_EMAIL}>`,
        to: body.email,
        subject: `Order Confirmation - ${body.order_id} is successful!`,
        react: EmailTemplate({ items: parsedItems, order_id: body.order_id, name: body.name, total: body.total }),
    });
    return { data, error };
}

export async function SendPaymentLinkEmail(body: BodyProps) {
    const { items } = body;
    const parsedItems: Item[] = ItemParse(items);
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment/${body.order_id}`;
    const { data, error } = await resend.emails.send({
        from: `MadamSpace <${process.env.NEXT_PUBLIC_APP_EMAIL}>`,
        to: body.email,
        subject: `Order - ${body.order_id} payment link`,
        react: DirectPayment({ order_id: body.order_id, name: body.name, total: body.total, link, items: parsedItems }),
    });
    return { data, error };
}