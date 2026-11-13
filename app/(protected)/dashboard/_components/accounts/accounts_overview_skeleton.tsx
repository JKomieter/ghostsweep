import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton"

/** Placeholder for the privacy score card and metrics while account data loads. */
export default function AccountsOverviewSkeleton() {
    return (
        <SkeletonGroup label="Loading account summary" className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="rounded-lg border border-foreground/5 bg-foreground/2 p-6 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-28" />
            </div>
            <div className="lg:col-span-4 grid grid-cols-3 gap-4">
                {["Accounts", "Breached", "Unused"].map((label) => (
                    <div key={label} className="rounded-lg border border-foreground/5 bg-foreground/2 p-4 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                ))}
            </div>
        </SkeletonGroup>
    )
}
