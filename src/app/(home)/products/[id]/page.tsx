import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productService } from "@/src/server/services/products";
import ProductDetailClient from "./components/ProductDetailClient";

type ProductPageParams = {
    params: Promise<{ id: string }>;
};

function toProductId(value: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return 0;
    return parsed;
}

export async function generateStaticParams() {
    try {
        const products = await productService.getProducts();
        return products.map((product) => ({ id: String(product.id) }));
    } catch (error) {
        console.warn("[products/[id]] Skipping static params generation:", error);
        return [];
    }
}

export async function generateMetadata({ params }: ProductPageParams): Promise<Metadata> {
    const { id } = await params;
    const productId = toProductId(id);
    if (!productId) {
        return {
            title: "Product Not Found | MadamSpace",
            description: "The product you are looking for is unavailable.",
        };
    }

    const product = await productService.getProductById(productId);
    if (!product) {
        return {
            title: "Product Not Found | MadamSpace",
            description: "The product you are looking for is unavailable.",
        };
    }

    return {
        title: `${product.name} | MadamSpace`,
        description: product.description,
        openGraph: {
            title: `${product.name} | MadamSpace`,
            description: product.description,
            images: product.image ? [product.image] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params }: ProductPageParams) {
    const { id } = await params;
    const productId = toProductId(id);
    if (!productId) return notFound();
    return <ProductDetailClient productId={productId} />;
}
