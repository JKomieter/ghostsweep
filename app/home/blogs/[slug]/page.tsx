// app/home/blogs/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, formatBlogDate } from "@/lib/blog";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Raw HTML in posts is allowed (rehype-raw) but always sanitized afterwards: GitHub's safe
// allowlist strips <script>, <iframe>, event handlers, style and javascript: URLs.
// className is additionally allowed so styled HTML in posts keeps its classes.
const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        "*": [...(defaultSchema.attributes?.["*"] ?? []), "className"],
    },
};
import type { Components } from "react-markdown";

// Render each post on first request, then serve it statically (refreshed hourly).
export const revalidate = 3600;
export function generateStaticParams() {
    return [];
}

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata(
    rawParams: PageParams
): Promise<Metadata> {
    const resolvedParams = await rawParams.params;
    const { slug } = resolvedParams;

    const post = await getPostBySlug(slug);

    if (!post) {
        return { title: "Post Not Found | GhostSweep Blog" };
    }

    return {
        title: `${post.title} | GhostSweep Blog`,
        description:
            post.excerpt ||
            `Read "${post.title}" on the GhostSweep blog.`,
        keywords: [
            post.title,
            post.category || "privacy",
            "privacy",
            "security",
            "digital safety",
        ],
        openGraph: {
            title: post.title,
            description:
                post.excerpt || `Read this article on privacy and security.`,
            url: `https://www.ghostsweep.com/home/blogs/${slug}`,
            type: "article",
            authors: ["GhostSweep"],
            publishedTime: post.published_at
                ? new Date(post.published_at).toISOString()
                : undefined,
            images: post.cover_image_url
                ? [
                      {
                          url: post.cover_image_url,
                          width: 1200,
                          height: 630,
                          alt: post.title,
                      },
                  ]
                : [],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description:
                post.excerpt ||
                `Read this article on the GhostSweep blog.`,
            images: post.cover_image_url ? [post.cover_image_url] : [],
        },
        alternates: {
            canonical: `https://www.ghostsweep.com/home/blogs/${slug}`,
        },
    };
}

export default async function BlogPostPage(rawParams: PageParams) {
    const resolvedParams = await rawParams.params;
    const { slug } = resolvedParams;

    const post = await getPostBySlug(slug);
    if (!post) notFound();

    const dateLabel = formatBlogDate(post.published_at);

    const components: Components = {
        h1: (props) => (
            <h1
                className="mt-10 mb-4 text-2xl font-semibold tracking-tight text-foreground"
                {...props}
            />
        ),
        h2: (props) => (
            <h2
                className="mt-10 mb-4 text-xl font-semibold tracking-tight text-foreground"
                {...props}
            />
        ),
        h3: (props) => (
            <h3
                className="mt-8 mb-3 text-lg font-medium text-foreground"
                {...props}
            />
        ),
        p: (props) => (
            <p
                className="my-4 text-[15px] leading-[1.8] text-foreground/50"
                {...props}
            />
        ),
        ul: (props) => (
            <ul
                className="my-4 list-disc pl-5 text-[15px] text-foreground/50 space-y-1.5"
                {...props}
            />
        ),
        ol: (props) => (
            <ol
                className="my-4 list-decimal pl-5 text-[15px] text-foreground/50 space-y-1.5"
                {...props}
            />
        ),
        li: (props) => <li className="leading-[1.8]" {...props} />,
        a: ({ href, children, ...rest }) => (
            <a
                href={href}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={
                    href?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                }
                className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                {...rest}
            >
                {children}
            </a>
        ),
        blockquote: (props) => (
            <blockquote
                className="my-6 border-l-2 border-emerald-500/30 pl-5 text-[15px] italic text-foreground/65"
                {...props}
            />
        ),
        code: (props) => (
            <code
                className="rounded bg-foreground/5 px-1.5 py-0.5 text-[13px] font-mono text-emerald-600 dark:text-emerald-400"
                {...props}
            />
        ),
        pre: (props) => (
            <pre
                className="my-6 overflow-x-auto rounded-xl bg-foreground/3 border border-foreground/5 p-4 text-[13px] font-mono text-foreground/70"
                {...props}
            />
        ),
        img: ({ src = "", alt = "", ...rest }) => (
            <span className="my-6 block overflow-hidden rounded-xl border border-foreground/5 bg-foreground/3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    {...rest}
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="block w-full h-auto max-h-[36rem] object-contain"
                />
            </span>
        ),
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-6 pt-24 pb-20 sm:pt-32 space-y-10">
                {/* Back */}
                <Link
                    href="/home/blogs"
                    className="inline-flex items-center gap-1.5 text-xs text-foreground/55 hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to blog
                </Link>

                {/* Header */}
                <header className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/55">
                        {post.category && (
                            <span className="rounded-full border border-foreground/5 bg-foreground/3 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/65">
                                {post.category}
                            </span>
                        )}
                        {dateLabel && <span>{dateLabel}</span>}
                        {post.reading_time && (
                            <span>· {post.reading_time} min read</span>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-base text-foreground/65 font-light leading-relaxed max-w-xl">
                            {post.excerpt}
                        </p>
                    )}

                    {post.cover_image_url && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/3 w-full">
                            {/* Natural aspect ratio — never crop; very tall images are capped and letterboxed. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.cover_image_url}
                                alt={post.title}
                                fetchPriority="high"
                                decoding="async"
                                className="block w-full h-auto max-h-[36rem] object-contain"
                            />
                        </div>
                    )}
                </header>

                {/* Content */}
                <article>
                    {post.content_md ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                            components={components}
                        >
                            {post.content_md}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-sm text-foreground/65">
                            No content yet for this article.
                        </p>
                    )}
                </article>

                {/* Footer CTA */}
                <section className="mt-12 rounded-2xl border border-foreground/10 bg-foreground/3 p-7 space-y-4">
                    <h2 className="text-base font-semibold text-foreground">
                        See your own digital footprint
                    </h2>
                    <p className="text-sm text-foreground/65 leading-relaxed max-w-lg">
                        Connect your inbox in read-only mode and see which companies
                        still hold your data, what&apos;s been breached, and where to start
                        cleaning up.
                    </p>
                    <Link
                        href="/login?mode=signup"
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 transition"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Start a free scan
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </section>
            </div>
        </main>
    );
}
