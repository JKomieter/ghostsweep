import { Ghost } from "lucide-react"
import { SkeletonGroup } from "@/components/ui/skeleton"
import { BlogPostCardSkeleton } from "@/components/blog-post-card-skeleton"

// The header is static copy, so render it for real; only the grid is a placeholder.
export default function Loading() {
    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 sm:pt-32 space-y-12">
                <header className="text-center max-w-2xl mx-auto space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs text-foreground/50">
                        <Ghost className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        GhostSweep Blog
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.08]">
                        Privacy insights.
                        <br />
                        <span className="text-foreground/55">Practical guides.</span>
                    </h1>
                    <p className="text-base text-foreground/65 font-light leading-relaxed max-w-lg mx-auto">
                        Deep dives on data breaches, forgotten accounts, privacy laws,
                        and practical ways to reduce your digital footprint.
                    </p>
                </header>

                <SkeletonGroup label="Loading articles" className="grid gap-5 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <BlogPostCardSkeleton key={i} />
                    ))}
                </SkeletonGroup>
            </div>
        </main>
    )
}
