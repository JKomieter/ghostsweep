"use client";

import { useAnalytics } from "@/hooks/ga";

export default function AnalyticsProvider({ children }: {children: React.ReactNode}) {
    useAnalytics();
    return <>{children}</>;
}