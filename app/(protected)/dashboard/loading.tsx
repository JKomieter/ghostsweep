import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton"

/**
 * Route-level fallback for every dashboard page. Mirrors the common page
 * shape (title, stat row, main panel) so the layout doesn't jump on load.
 */
export default function Loading() {
    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <SkeletonGroup label="Loading dashboard" className="max-w-6xl mx-auto space-y-8">
                {/* Page title */}
                <div className="space-y-3">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-lg border border-foreground/5 bg-foreground/2 p-6 space-y-6"
                        >
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    ))}
                </div>

                {/* Main panel */}
                <div className="rounded-lg border border-foreground/5 bg-foreground/2 p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-28" />
                    </div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3.5 w-2/5" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
                        </div>
                    ))}
                </div>
            </SkeletonGroup>
        </div>
    )
}
