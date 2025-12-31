"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import * as pixel from "@/lib/meta-pixels";
import Image from "next/image";

interface FBProps {
    eventId?: string;
}

const FBPixel = ({ eventId }: FBProps) => {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();
    const pixelId = eventId || pixel.FB_PIXEL_ID;

    useEffect(() => {
        if (!loaded) return;
        pixel.pageview();
    }, [pathname, loaded]);

    return (
        <>
            <Script
                id="fb-pixel"
                src="/scripts/pixel.js"
                strategy="afterInteractive"
                onLoad={() => setLoaded(true)}
                data-pixel-id={pixelId}
            />
            {/* Noscript fallback for users with JS disabled */}
            <noscript>
                <Image
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
};

export default FBPixel;