import OrderPageClient from "./components/order-page-client";

export default async function CheckoutOrderDetailPage({ params }: { params: { order_id: string } }) {
    const { order_id } = await params;
    return (
        <OrderPageClient orderId={order_id} />
    );
}
