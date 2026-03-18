import { Item } from "@/src/types/type";

export default async function DirectPayment(params: {
  link: string;
  order_id: string;
  name: string;
  items: Item[];
  total: number;
}) {
  const { link, order_id, name, total, items } = params;

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
          overflow: "hidden",
          border: "1px solid #eaeaea",
        }}
      >
        <tbody>
          {/* HEADER */}
          <tr>
            <td
              style={{
                padding: "24px",
                textAlign: "center",
                background: "#6c47ff",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: "#ffffff",
                  color: "#6c47ff",
                  fontWeight: "bold",
                  width: "40px",
                  height: "40px",
                  lineHeight: "40px",
                  borderRadius: "8px",
                  fontSize: "20px",
                  marginBottom: "8px",
                }}
              >
                M
              </div>

              <h2 style={{ margin: "6px 0 0 0", fontWeight: 600 }}>
                Madamspace
              </h2>
            </td>
          </tr>

          {/* BODY */}
          <tr>
            <td style={{ padding: "30px" }}>
              <h2 style={{ marginTop: 0 }}>Complete Your Payment</h2>

              <p>
                Hello <strong>{name}</strong>,
              </p>

              <p>
                Thank you for your order. Your order has been created but the
                payment has not been completed yet.
              </p>

              <p>Please complete your payment to process your order.</p>

              {/* ORDER SUMMARY */}
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  marginTop: "20px",
                  background: "#f8f9ff",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: "8px" }}>
                      <strong>Order ID:</strong> {order_id}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ paddingBottom: "8px" }}>
                      <strong>Total Amount:</strong>{" "}
                      <span
                        style={{
                          color: "#6c47ff",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {total}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ITEMS */}
              <div style={{ marginTop: "20px" }}>
                {items.map((item, index) => (
                  <table
                    key={index}
                    width="100%"
                    cellPadding={0}
                    cellSpacing={0}
                    style={{
                      marginBottom: "16px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "12px",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td width="90">
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "80px",
                              borderRadius: "6px",
                            }}
                          />
                        </td>

                        <td>
                          <strong>{item.name}</strong>

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            Quantity: {item.quantity}
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                            }}
                          >
                            Category: {item.category}
                          </div>

                          <div
                            style={{
                              marginTop: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            Subtotal: {item.quantity * item.price}
                          </div>

                          {item.videoUrl && (
                            <div style={{ marginTop: "6px" }}>
                              <a
                                href={item.videoUrl}
                                style={{
                                  fontSize: "13px",
                                  color: "#6c47ff",
                                  textDecoration: "none",
                                }}
                              >
                                Watch preview
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ))}
              </div>

              {/* PAYMENT BUTTON */}
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                <a
                  href={link}
                  style={{
                    backgroundColor: "#6c47ff",
                    color: "#ffffff",
                    padding: "14px 36px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    textDecoration: "none",
                    fontSize: "16px",
                    display: "inline-block",
                  }}
                >
                  Complete Payment
                </a>
              </div>

              {/* FALLBACK LINK */}
              <p style={{ fontSize: "13px", color: "#666" }}>
                If the button doesn't work, copy and paste this link into your
                browser:
              </p>

              <p
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  wordBreak: "break-all",
                }}
              >
                {link}
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
              ⚠️ This payment link may expire soon. Please complete your payment
              as soon as possible.

              <div style={{ marginTop: "10px" }}>
                This email was sent automatically by{" "}
                <strong>Madamspace</strong>. Please do not reply.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}