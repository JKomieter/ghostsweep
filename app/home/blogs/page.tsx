// app/home/blogs/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight, Ghost } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    category: string | null;
    cover_image_url: string | null;
    reading_time: number | null;
    published_at: string | null;
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default async function BlogIndexPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("blog_posts")
        .select(
            "id, slug, title, excerpt, category, cover_image_url, reading_time, published_at"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error) {
        console.error("Error fetching blog posts:", error);
    }

    const posts: BlogPost[] = data ?? [];

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 sm:pt-32 space-y-12">
                {/* Header */}
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

                {/* Empty state */}
                {posts.length === 0 && (
                    <div className="rounded-2xl border border-foreground/5 bg-foreground/2 p-8 text-center">
                        <p className="text-sm text-foreground/65">
                            No articles published yet. Check back soon.
                        </p>
                    </div>
                )}

                {/* Posts grid */}
                {posts.length > 0 && (
                    <section className="grid gap-5 md:grid-cols-2">
                        {posts.map((post) => {
                            const dateLabel = formatDate(post.published_at);
                            return (
                                <Link
                                    key={post.id}
                                    href={`/home/blogs/${post.slug}`}
                                    className="group flex h-full flex-col rounded-2xl border border-foreground/5 bg-foreground/2 overflow-hidden hover:border-foreground/10 transition-all duration-300"
                                >
                                    {/* Cover image */}
                                    {post.cover_image_url && (
                                        <div className="overflow-hidden border-b border-foreground/5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 p-6 space-y-3">
                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/55">
                                            {post.category && (
                                                <span className="rounded-full border border-foreground/5 bg-foreground/3 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/65">
                                                    {post.category}
                                                </span>
                                            )}
                                            {dateLabel && <span>{dateLabel}</span>}
                                            {post.reading_time && (
                                                <span>
                                                    · {post.reading_time} min read
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-base font-medium text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {post.title}
                                        </h2>

                                        {/* Excerpt */}
                                        {post.excerpt && (
                                            <div className="text-xs text-foreground/65 line-clamp-3 prose prose-invert prose-[0.78rem] max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {post.excerpt}
                                                </ReactMarkdown>
                                            </div>
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
                        })}
                    </section>
                )}
            </div>
        </main>
    );
}
