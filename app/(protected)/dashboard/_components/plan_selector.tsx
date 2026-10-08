// app/dashboard/billing/_components/plan-selector.tsx
import Link from "next/link"
import { ReactNode } from "react"

export function PlanCard({
    plan,
    isActive,
    children,
}: {
    plan: "monthly" | "yearly"
    isActive: boolean
    children: ReactNode
}) {
    return (
        <Link
            href={`/dashboard/billing?plan=${plan}`}
            prefetch={false}
            className={`block rounded-xl border p-4 cursor-pointer transition-all ${isActive
                    ? "border-primary/80 bg-primary/5 shadow-[0_0_0_1px_rgba(0,242,222,0.4)]"
                    : "border-foreground/10 bg-background hover:border-primary/40"
                }`}
        >
            {children}
        </Link>
    )
}