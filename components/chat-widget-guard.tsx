"use client";

import { usePathname } from "next/navigation";

// The Qurius chat widget is loaded only on the homepage (app/home/page.tsx),
// but it injects its launcher/iframe into <body>, which survives client-side
// navigation. Hide those elements on every route other than the homepage.
const HOMEPAGE_PATHS = new Set(["/", "/home"]);

export default function ChatWidgetGuard() {
    const pathname = usePathname();
    if (HOMEPAGE_PATHS.has(pathname)) return null;

    return (
        <style>{`
            #qurius-widget-launcher,
            #qurius-widget-iframe-container,
            #qurius-widget-fallback-close {
                display: none !important;
            }
        `}</style>
    );
}
