"use server";
type SendEmailConfirmationPayload = {
    email: string;
    name: string;
    order_id: string;
    items: string | null | undefined;
    total: number;
}
export async function SendEmailConfirmation(payload: SendEmailConfirmationPayload) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.BEARER_TOKEN || "" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.detail || data?.error || 'Failed to create Email confirmation');
    }
    return data;
}