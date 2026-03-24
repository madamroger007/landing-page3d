import { Orders } from "@/src/types/type";
import { formatIDR, getYouTubeEmbedUrl } from "@/src/utils/utils";
import Image from "next/image";

type OrderItemsCardProps = {
    order: Orders;
};

export default function OrderItemsCard({ order }: OrderItemsCardProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold mb-3">Items Template Order</h2>
            <div className="space-y-2">
                {order.items.map((item) => (
                    <div
                        key={`${order.order_id}-${item.id}`}
                        className="max-md:flex-wrap gap-5 flex items-center justify-between border-b border-white/10 py-2"
                    >
                        <div>
                            <div className="flex gap-4 items-center">
                                <p className="text-md font-medium ">{item.name}</p>
                                <p className="text-md text-gray-300">{formatIDR(item.price * item.quantity)}</p>
                            </div>

                            <p className="text-xs text-white/50">Qty: {item.quantity}</p>
                        </div>

                        <div className="w-32 h-32 rounded overflow-hidden">
                            {item.videoUrl ? (
                                <div className="relative w-full h-full">
                                    <iframe
                                        src={getYouTubeEmbedUrl(item.videoUrl) || ""}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                <Image
                                    src={item.image || "/nft-card-1.png"}
                                    alt={item.name}
                                    fill
                                    loading="lazy"
                                    className="object-cover transition-transform duration-500 group-hover/fire:scale-110"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}