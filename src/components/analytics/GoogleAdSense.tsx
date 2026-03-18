import Script from "next/script";

type GoogleAdSenseProps = {
    publisherId?: string;
};

export default function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
    if (!publisherId) return null;

    return (
        <Script
            id="adsense-script"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        />
    );
}
