import type { Metadata } from "next";
import ProductsPageClient from "./components/ProductsPageClient";

export const metadata: Metadata = {
  title: "Digital Services & Creative Products | MadamSpace",
  description:
    "Browse digital services including website design, video editing, image editing, and creative content packages for your business.",
  keywords: [
    "digital services",
    "website design service",
    "video editing service",
    "image editing service",
    "creative design service",
    "MadamSpace products",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Digital Services & Creative Products | MadamSpace",
    description:
      "Find website design, video editing, image editing, and other digital creative services.",
    url: process.env.NEXT_PUBLIC_APP_URL + "/products",
    type: "website",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
