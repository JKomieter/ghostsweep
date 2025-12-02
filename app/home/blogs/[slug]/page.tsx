// app/blog/[slug]/page.tsx
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, ArrowRight } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import type { Components } from "react-markdown";

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

type PageParams = { params: Promise<{ slug: string }> };

export default async function BlogPostPage(rawParams: PageParams) {
    const resolvedParams = await rawParams.params;
    const { slug } = resolvedParams;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("blog_posts")
        .select(
            "id, slug, title, excerpt, content_md, category, cover_image_url, reading_time, published_at, status"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error) console.error("Error fetching blog post:", error);
    if (!data) notFound();

    const post = data as BlogPost;
    const dateLabel = formatDate(post.published_at);

    // Custom renderers to make markdown look clean + on-brand
    const components: Components = {
        h1: (props) => (
            <h1
                className="mt-6 mb-3 text-2xl font-semibold tracking-tight"
                {...props}
            />
        ),
        h2: (props) => (
            <h2
                className="mt-6 mb-3 text-xl font-semibold tracking-tight"
                {...props}
            />
        ),
        h3: (props) => (
            <h3
                className="mt-5 mb-2 text-lg font-semibold"
                {...props}
            />
        ),
        p: (props) => (
            <p
                className="my-3 text-sm leading-relaxed text-muted-foreground"
                {...props}
            />
        ),
        ul: (props) => (
            <ul
                className="my-3 list-disc pl-5 text-sm text-muted-foreground space-y-1"
                {...props}
            />
        ),
        ol: (props) => (
            <ol
                className="my-3 list-decimal pl-5 text-sm text-muted-foreground space-y-1"
                {...props}
            />
        ),
        li: (props) => <li className="leading-relaxed" {...props} />,
        a: ({ href, children, ...rest }) => (
            <a
                href={href}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                {...rest}
            >
                {children}
            </a>
        ),
        blockquote: (props) => (
            <blockquote
                className="my-4 border-l-2 border-primary/60 pl-4 text-sm italic text-muted-foreground"
                {...props}
            />
        ),
        code: (props) => (
            <code
                className="rounded bg-zinc-900/70 px-1.5 py-0.5 text-[11px] font-mono text-zinc-100"
                {...props}
            />
        ),
        pre: (props) => (
            <pre
                className="my-4 overflow-x-auto rounded-lg bg-zinc-950/80 p-3 text-[11px] font-mono text-zinc-100"
                {...props}
            />
        ),
        img: ({ src = "", alt = "", ...rest }) => (
            <span className="my-4 block overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="w-full object-cover"
                    {...rest}
                />
            </span>
        ),
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-8">
                {/* Back link */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/home/blogs"
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
                        {post.reading_time && <span>· {post.reading_time} min read</span>}
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
                        <div className="mt-3 relative overflow-hidden rounded-xl border border-white/10 h-64 w-full">
                            <Image
                                src={post.cover_image_url}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                </header>

                {/* Markdown Content */}
                <article>
                    {post.content_md ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={components}
                            // className="prose prose-invert prose-sm max-w-none"
                        >
                            {post.content_md}
                        </ReactMarkdown>
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