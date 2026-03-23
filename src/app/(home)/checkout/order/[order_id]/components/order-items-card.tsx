import { Orders } from "@/src/types/type";
import { formatIDR } from "@/src/utils/utils";

type OrderItemsCardProps = {
    order: Orders;
};

export default function OrderItemsCard({ order }: OrderItemsCardProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold mb-3">Items</h2>
            <div className="space-y-2">
                {order.items.map((item) => (
                    <div
                        key={`${order.order_id}-${item.id}`}
                        className="flex items-center justify-between border-b border-white/10 py-2"
                    >
                        <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-white/50">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm">{formatIDR(item.price * item.quantity)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}