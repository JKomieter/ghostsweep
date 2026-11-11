import { ArrowLeft } from "lucide-react"
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton"

const PARAGRAPH_WIDTHS = [
    ["w-full", "w-full", "w-11/12", "w-3/5"],
    ["w-full", "w-10/12", "w-full", "w-2/5"],
    ["w-full", "w-full", "w-4/5"],
]

export default function Loading() {
    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-6 pt-24 pb-20 sm:pt-32 space-y-10">
                <span className="inline-flex items-center gap-1.5 text-xs text-foreground/55">
                    <ArrowLeft className="h-3 w-3" />
                    Back to blog
                </span>

                <SkeletonGroup label="Loading article" className="space-y-10">
                    <header className="space-y-5">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-16 rounded-full" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-2/3" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full max-w-xl" />
                            <Skeleton className="h-4 w-4/5 max-w-xl" />
                        </div>
                        <Skeleton className="mt-4 aspect-1200/630 w-full rounded-2xl" />
                    </header>

                    <div className="space-y-8">
                        {PARAGRAPH_WIDTHS.map((lines, p) => (
                            <div key={p} className="space-y-3">
                                {lines.map((w, l) => (
                                    <Skeleton key={l} className={`h-3.5 ${w}`} />
                                ))}
                            </div>
                        ))}
                    </div>
                </SkeletonGroup>
            </div>
        </main>
    )
}
