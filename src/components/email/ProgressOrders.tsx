import { Item } from "@/src/types/type";
import { formatCurrency } from "@/src/utils/format";
import * as React from "react";

interface ProgressOrdersProps {
    name: string;
    order_id: string;
    status: string;
    items: Item[];
    total: number;
    email?: string;
    productLink?: string | null;
}

export default function ProgressOrders({
    name,
    order_id,
    status,
    items,
    total,
    productLink,
}: ProgressOrdersProps) {
    const getStatusInfo = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return {
                    title: "Your Order is Pending",
                    message: "We’ve received your order and are preparing it.",
                };
            case "progress":
                return {
                    title: "Order in Progress",
                    message: "Your order is currently being processed.",
                };
            case "revisi":
                return {
                    title: "Revision Needed",
                    message: "Your order needs revision. Please review it.",
                };
            case "done":
                return {
                    title: "Order Completed 🎉",
                    message: "Your order has been completed successfully.",
                };
            case "cancelled":
                return {
                    title: "Order Cancelled",
                    message: "Your order has been cancelled.",
                };
            default:
                return {
                    title: "Order Update",
                    message: `Status: ${status}`,
                };
        }
    };

    const { title, message } = getStatusInfo(status);

    return (
        <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{
                backgroundColor: "#f4f6fb",
                padding: "20px 10px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <tbody>
                <tr>
                    <td align="center">
                        {/* CONTAINER */}
                        <table
                            width="100%"
                            cellPadding={0}
                            cellSpacing={0}
                            style={{
                                maxWidth: "600px",
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                overflow: "hidden",
                            }}
                        >
                            <tbody>
                                {/* HEADER */}
                                <tr>
                                    <td
                                        align="center"
                                        style={{
                                            backgroundColor: "#6c47ff",
                                            padding: "24px",
                                            color: "#ffffff",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: "#ffffff",
                                                color: "#6c47ff",
                                                width: "40px",
                                                height: "40px",
                                                lineHeight: "40px",
                                                borderRadius: "6px",
                                                fontWeight: "bold",
                                                margin: "0 auto 10px",
                                            }}
                                        >
                                            M
                                        </div>
                                        <h2 style={{ margin: 0 }}>Madamspace</h2>
                                    </td>
                                </tr>

                                {/* BODY */}
                                <tr>
                                    <td style={{ padding: "24px" }}>
                                        <h2 style={{ marginTop: 0 }}>{title}</h2>

                                        <p>
                                            Hi <strong>{name}</strong>,
                                        </p>

                                        <p>
                                            Order ID:{" "}
                                            <strong>{order_id}</strong>
                                        </p>

                                        <p>{message}</p>

                                        <table
                                            width="100%"
                                            cellPadding={0}
                                            cellSpacing={0}
                                            style={{
                                                marginTop: "12px",
                                                background: "#f8f9ff",
                                                borderRadius: "6px",
                                            }}
                                        >
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: "12px", fontSize: "13px", color: "#444" }}>
                                                        <strong>Doing Order Link:</strong>{" "}
                                                        {productLink ? (
                                                            <a
                                                                href={productLink}
                                                                style={{ color: "#6c47ff", textDecoration: "underline" }}
                                                            >
                                                                Open Product Link
                                                            </a>
                                                        ) : (
                                                            "Not available yet"
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* ORDER TABLE */}
                                        <table
                                            width="100%"
                                            cellPadding={8}
                                            cellSpacing={0}
                                            style={{
                                                borderCollapse: "collapse",
                                                marginTop: "16px",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <thead>
                                                <tr style={{ background: "#f2f3f7" }}>
                                                    <th align="left">Item</th>
                                                    <th align="center">Qty</th>
                                                    <th align="right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.name}</td>
                                                        <td align="center">
                                                            {item.quantity}
                                                        </td>
                                                        <td align="right">

                                                            {formatCurrency(item.price)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* TOTAL */}
                                        <table
                                            width="100%"
                                            style={{ marginTop: "12px" }}
                                        >
                                            <tbody>
                                                <tr>
                                                    <td align="right">
                                                        <strong>
                                                            Total: {formatCurrency(total)}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <p
                                            style={{
                                                marginTop: "24px",
                                                fontSize: "14px",
                                                color: "#555",
                                            }}
                                        >
                                            Thanks for choosing Madamspace 🙌
                                        </p>
                                    </td>
                                </tr>

                                {/* FOOTER */}
                                <tr>
                                    <td
                                        align="center"
                                        style={{
                                            padding: "16px",
                                            fontSize: "12px",
                                            color: "#888",
                                            borderTop: "1px solid #eee",
                                        }}
                                    >
                                        This is an automated email. Please do not
                                        reply.
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* SPACING */}
                        <div style={{ height: "20px" }} />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
