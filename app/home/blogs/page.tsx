// app/blog/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;       // markdown-safe
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
        <main className="min-h-screen bg-[#050505] text-white">
            <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 space-y-10">
                {/* Header */}
                <section className="space-y-3">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/2 px-3 py-1 text-[11px] text-white/60">
                        <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        GhostSweep Blog
                    </p>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-light tracking-tight sm:text-4xl text-white">
                            Understand and shrink your digital footprint.
                        </h1>
                        <p className="max-w-2xl text-sm text-white/60">
                            Deep dives on data breaches, forgotten accounts, privacy laws,
                            and practical ways to reduce the number of companies holding your
                            personal data.
                        </p>
                    </div>
                </section>

                {/* If no posts */}
                {posts.length === 0 && (
                    <div className="rounded-lg border border-white/5 bg-white/2 p-6 text-sm text-white/60">
                        No articles published yet. Check back soon.
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
                                    className="group flex h-full flex-col rounded-lg border border-white/5 bg-white/2 p-4 shadow-sm transition hover:border-white/10 hover:bg-white/3 backdrop-blur-sm"
                                >
                                    {/* Optional cover image */}
                                    {post.cover_image_url && (
                                        <div className="mb-3 overflow-hidden rounded-lg border border-white/5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 text-[11px] text-white/60">
                                            {post.category && (
                                                <span className="rounded-full border border-white/5 bg-white/2 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                                    {post.category}
                                                </span>
                                            )}
                                            {dateLabel && <span>{dateLabel}</span>}
                                            {post.reading_time && (
                                                <span>· {post.reading_time} min read</span>
                                            )}
                                        </div>

                                        <h2 className="text-base font-light leading-snug group-hover:text-white text-white/90">
                                            {post.title}
                                        </h2>

                                        {post.excerpt && (
                                            <div className="text-xs text-white/60 line-clamp-3 prose prose-invert prose-[0.78rem] max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {post.excerpt}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 inline-flex items-center text-[11px] font-light text-white">
                                        Read article
                                        <ArrowRight className="ml-1 h-3 w-3" />
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