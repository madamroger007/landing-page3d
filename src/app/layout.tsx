import type { Metadata } from "next";
import { Suspense } from "react";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ProductsProviders from "../store/providers/ProductsProviders";
import { CartProvider } from "../store/context/cart/CartContext";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";
import GoogleAdSense from "../components/analytics/GoogleAdSense";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MadamSpace - Digital Services",
  description: "Digital Services for make your designs come true and make your work easier",
  authors: [
    {
      name: "Adam Setiadi",
      url: "https://www.adamstd.my.id/",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID;
  const adSensePublisherId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} antialiased selection:bg-neon-blue selection:text-white cursor-hidden`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={gaMeasurementId} />
        </Suspense>
        <GoogleAdSense publisherId={adSensePublisherId} />
        <CartProvider>
          <ProductsProviders>{children}</ProductsProviders>
        </CartProvider>
      </body>
    </html>
  );
}
