import type { MetadataRoute } from "next";

function getBaseUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

    if (!envUrl) return "http://localhost:3000";

    const normalized = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return normalized.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getBaseUrl();

    return {
        rules: {
            userAgent: "*",
            disallow: ["/dashboard", "/dasboard"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
