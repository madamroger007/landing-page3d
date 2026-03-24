import CheckoutPageClient from "./components/page-client";

type MidtransClientConfig = {
  clientKey: string;
  environment: "production" | "sandbox";
};

function getMidtransClientConfig(): MidtransClientConfig | null {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  if (!clientKey) {
    return null;
  }

  return {
    clientKey,
    environment: process.env.MIDTRANS_IS_PRODUCTION === "true" ? "production" : "sandbox",
  };
}

export default function CheckoutPage() {
  const midtransConfig = getMidtransClientConfig();

  return <CheckoutPageClient midtransConfig={midtransConfig} />;
}
