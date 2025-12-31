"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const FacebookPixelClient = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Load Facebook Pixel script
        import("react-facebook-pixel")
            .then((x) => x.default)
            .then((ReactPixel) => {
                ReactPixel.init(process.env.NEXT_PUBLIC_META_PIXEL_ID!);
                ReactPixel.pageView();
            });
    }, []);

    useEffect(() => {
        // Track page views on route change
        import("react-facebook-pixel")
            .then((x) => x.default)
            .then((ReactPixel) => {
                ReactPixel.pageView();
            });
    }, [pathname, searchParams]);

    return null;
};

export const FacebookPixel = () => {
    return (
        <Suspense fallback={null}>
            <FacebookPixelClient />
        </Suspense>
    );
};