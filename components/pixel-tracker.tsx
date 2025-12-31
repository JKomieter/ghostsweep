"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import * as pixel from "@/lib/meta-pixels";

interface FBProps {
    eventId?: string
}

const FBPixel = ({ eventId }: FBProps) => {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (!loaded) return;

        pixel.pageview();
    }, [pathname, loaded]);

    return (
        <div>
            <Script
                id="fb-pixel"
                src="/scripts/pixel.js"
                strategy="afterInteractive"
                onLoad={() => setLoaded(true)}
                data-pixel-id={eventId ? eventId : pixel.FB_PIXEL_ID}
            />
        </div>
    );
};

export default FBPixel;