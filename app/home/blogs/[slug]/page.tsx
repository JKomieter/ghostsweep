// app/blog/[slug]/page.tsx
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, ArrowRight } from "lucide-react";

type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content_md: string | null;
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

type PageParams =
    { params: Promise<{ slug: string }> };

export default async function BlogPostPage(rawParams: PageParams) {
    const resolvedParams =
            await rawParams.params

    const { slug } = resolvedParams as { slug: string };

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("blog_posts")
        .select(
            "id, slug, title, excerpt, content_md, category, cover_image_url, reading_time, published_at, status"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error) {
        console.error("Error fetching blog post:", error);
    }

    if (!data) {
        notFound();
    }

    const post = data as BlogPost;
    const dateLabel = formatDate(post.published_at);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-8">
                {/* Back link */}
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back to blog
                    </Link>
                </div>

                {/* Header */}
                <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {post.category && (
                            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                {post.category}
                            </span>
                        )}
                        {dateLabel && <span>{dateLabel}</span>}
                        {post.reading_time && (
                            <span>· {post.reading_time} min read</span>
                        )}
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            {post.excerpt}
                        </p>
                    )}

                    {post.cover_image_url && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="h-64 w-full object-cover"
                            />
                        </div>
                    )}
                </header>

                {/* Content */}
                <article className="prose prose-invert prose-sm max-w-none">
                    {/* 
            For now, render Markdown as plain text block with line breaks.
            Later you can swap this for react-markdown or your own Markdown renderer.
          */}
                    {post.content_md ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {post.content_md}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No content yet for this article.
                        </p>
                    )}
                </article>

                {/* Footer CTA */}
                <section className="mt-8 rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                    <h2 className="text-sm font-semibold tracking-tight">
                        See your own digital footprint with GhostSweep
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Connect your Gmail in read-only mode and see which companies still
                        hold your data, what’s been breached, and where to start cleaning up.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                    >
                        Start a free scan
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </section>
            </div>
        </main>
    );
}