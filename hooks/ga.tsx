"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + searchParams.toString();

        window.gtag?.("config", "G-FZ706P051X", {
            page_path: url,
        });
    }, [pathname, searchParams]);
}