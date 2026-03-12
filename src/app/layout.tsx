import type { Metadata } from "next";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ProductsProviders from "../store/providers/ProductsProviders";
import { CartProvider } from "../store/context/cart/CartContext";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFT Space | Create, Artwork and Sell",
  description: "The world's biggest advanced commercial center for crypto collectibles and non-fungible tokens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} antialiased selection:bg-neon-blue selection:text-white cursor-hidden`}
      >
        <CartProvider>
          <ProductsProviders>{children}</ProductsProviders>
        </CartProvider>
      </body>
    </html>
  );
}
