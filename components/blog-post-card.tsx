import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatBlogDate, type BlogPostSummary } from "@/lib/blog";

/**
 * Server-rendered blog card shared by the blog index and the homepage.
 * Excerpts are rendered as plain text (no markdown parser shipped/run per card).
 */
export function BlogPostCard({
    post,
    priority = false,
}: {
    post: BlogPostSummary;
    /** Eager-load the cover image (use for above-the-fold cards). */
    priority?: boolean;
}) {
    const dateLabel = formatBlogDate(post.published_at);
    const excerpt = post.excerpt ? stripMarkdown(post.excerpt) : null;

    return (
        <Link
            href={`/home/blogs/${post.slug}`}
            className="group flex h-full flex-col rounded-2xl border border-foreground/5 bg-foreground/2 overflow-hidden hover:border-foreground/10 transition-all duration-300"
        >
            {post.cover_image_url && (
                <div className="overflow-hidden border-b border-foreground/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        width={1200}
                        height={630}
                        loading={priority ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={priority ? "high" : "auto"}
                        className="aspect-1200/630 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                </div>
            )}

            <div className="flex-1 p-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/55">
                    {post.category && (
                        <span className="rounded-full border border-foreground/5 bg-foreground/3 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/65">
                            {post.category}
                        </span>
                    )}
                    {dateLabel && <span>{dateLabel}</span>}
                    {post.reading_time && <span>· {post.reading_time} min read</span>}
                </div>

                <h3 className="text-base font-medium text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {post.title}
                </h3>

                {excerpt && (
                    <p className="text-xs leading-relaxed text-foreground/65 line-clamp-3">
                        {excerpt}
                    </p>
                )}
            </div>

            <div className="px-6 pb-5">
                <span className="inline-flex items-center text-xs text-foreground/55 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Read article
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}

/** Cheap markdown → plain text for short excerpts. */
function stripMarkdown(md: string) {
    return md
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
        .replace(/<[^>]+>/g, "") // html tags
        .replace(/[*_~`#>]+/g, "") // emphasis, code, headings, quotes
        .replace(/\s+/g, " ")
        .trim();
}
