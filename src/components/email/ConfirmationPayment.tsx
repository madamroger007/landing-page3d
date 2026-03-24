import * as React from "react";
import { Item } from "../../types/type";
import { formatCurrency } from "@/src/utils/format";

interface EmailTemplateProps {
  items: Item[];
  name: string;
  order_id: string;
  total: number;
  links?: string;
}

export function ConfirmationPayment({ items, name, order_id, total, links }: EmailTemplateProps) {
  return (
    <div
      style={{
        backgroundColor: "#f4f6fb",
        padding: "20px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #eaeaea",
          overflow: "hidden",
        }}
      >
        <tbody>

          {/* HEADER */}
          <tr>
            <td
              style={{
                backgroundColor: "#6c47ff",
                padding: "24px",
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  lineHeight: "42px",
                  background: "#ffffff",
                  color: "#6c47ff",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  margin: "0 auto 8px",
                  fontSize: "20px",
                }}
              >
                M
              </div>

              <h2 style={{ margin: 0, fontWeight: 600 }}>Madamspace</h2>
            </td>
          </tr>

          {/* BODY */}
          <tr>
            <td style={{ padding: "30px" }}>
              <h2 style={{ marginTop: 0 }}>Payment Successful 🎉</h2>

              <p>
                Hello <strong>{name}</strong>,
              </p>

              <p>
                Thank you for your purchase. Your order{" "}
                <strong>{order_id}</strong> has been successfully paid and is now
                being processed.
              </p>

              <a href={links} style={{ color: "#6c47ff", textDecoration: "underline", fontSize: "14px", fontWeight: "bold" }}>
                View Your Order Here
              </a>

              {/* ORDER TABLE */}
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  marginTop: "20px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9ff" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Item</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Qty</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Price</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Preview</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item: Item, idx: number) => (
                    <tr key={idx}>
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <strong>{item.name}</strong>
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                          color: "#555",
                        }}
                      >
                        {item.quantity}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {formatCurrency(item.price)}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          width={50}
                          height={50}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            display: "block",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* TOTAL */}
                <tfoot>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      Subtotal:
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {formatCurrency(total)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      Total Paid:
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                        color: "#6c47ff",
                        fontSize: "16px",
                      }}
                    >
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* INFO */}
              <p
                style={{
                  marginTop: "24px",
                  fontSize: "14px",
                  color: "#555",
                }}
              >
                You will receive another email when your order is ready.
              </p>
            </td>
          </tr>

          {/* FOOTER */}
          <tr>
            <td
              style={{
                padding: "20px",
                textAlign: "center",
                fontSize: "12px",
                color: "#888",
                borderTop: "1px solid #eee",
              }}
            >
              This is an automated message from <strong>Madamspace</strong>.
              Please do not reply to this email.
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}