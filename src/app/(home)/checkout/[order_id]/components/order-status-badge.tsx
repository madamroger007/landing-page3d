import { labelClassName } from "../utils";
import { OrderLabel } from "../types";

type OrderStatusBadgeProps = {
    label: OrderLabel;
};

export default function OrderStatusBadge({ label }: OrderStatusBadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${labelClassName(label)}`}>
            {label.toUpperCase()}
        </span>
    );
}