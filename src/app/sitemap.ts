import type { MetadataRoute } from "next";
import { productService } from "@/src/server/services/products";

function getBaseUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

    if (!envUrl) return "http://localhost:3000";

    const normalized = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return normalized.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    try {
        const products = await productService.getProducts();

        const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
            url: `${baseUrl}/products/${product.id}`,
            lastModified: product.createdAt ? new Date(product.createdAt) : now,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        return [...staticRoutes, ...productRoutes];
    } catch (error) {
        console.warn("[sitemap] Falling back to static routes:", error);
        return staticRoutes;
    }
}
