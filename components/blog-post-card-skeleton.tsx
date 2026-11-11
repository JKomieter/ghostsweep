import { Skeleton } from "@/components/ui/skeleton"

/** Same footprint as <BlogPostCard> so the grid doesn't shift when posts arrive. */
export function BlogPostCardSkeleton() {
    return (
        <div className="flex h-full flex-col rounded-2xl border border-foreground/5 bg-foreground/2 overflow-hidden">
            <Skeleton className="aspect-1200/630 w-full rounded-none" />
            <div className="flex-1 p-6 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/5" />
                <div className="space-y-1.5 pt-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            </div>
            <div className="px-6 pb-5">
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    )
}
