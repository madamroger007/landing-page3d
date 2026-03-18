"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

type GoogleAnalyticsProps = {
    measurementId?: string;
};

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!measurementId || typeof window.gtag !== "function") return;

        const query = searchParams?.toString();
        const pagePath = query ? `${pathname}?${query}` : pathname;

        window.gtag("event", "page_view", {
            page_title: document.title,
            page_path: pagePath,
            page_location: window.location.href,
        });
    }, [measurementId, pathname, searchParams]);

    if (!measurementId) return null;

    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
                    gtag('config', '${measurementId}', {
            send_page_view: false,
            anonymize_ip: true,
          });
        `}
            </Script>
        </>
    );
}
