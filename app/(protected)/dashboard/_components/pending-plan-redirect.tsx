"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { consumePendingPlanPath } from "@/lib/pending-plan";

// Sends users who picked a paid plan before signing up (via Google or email confirmation)
// straight to that plan's checkout the first time they land in the dashboard.
export default function PendingPlanRedirect() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Always consume, so a plan the user already reached billing for can't hijack a later visit
        const path = consumePendingPlanPath();
        if (path && !pathname.startsWith("/dashboard/billing")) router.replace(path);
    }, [pathname, router]);

    return null;
}
