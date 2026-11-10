// app/home/blogs/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Ghost } from "lucide-react";
import { getBlogPage } from "@/lib/blog";
import { BlogPostCard } from "@/components/blog-post-card";

type PageProps = { searchParams: Promise<{ page?: string }> };

function parsePage(raw: string | undefined) {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : 1;
}

function pageHref(page: number) {
    return page <= 1 ? "/home/blogs" : `/home/blogs?page=${page}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const page = parsePage((await searchParams).page);
    if (page === 1) return {};
    return {
        title: `Blog – Page ${page} | GhostSweep`,
        alternates: { canonical: `https://www.ghostsweep.com${pageHref(page)}` },
    };
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
    const requestedPage = parsePage((await searchParams).page);
    // Cached per page (see lib/blog.ts) — only one page of posts is fetched.
    const { posts, page, totalPages } = await getBlogPage(requestedPage);

    if (posts.length === 0 && requestedPage > 1) notFound();

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
                        {posts.map((post, i) => (
                            <BlogPostCard key={post.id} post={post} priority={i < 2} />
                        ))}
                    </section>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav
                        aria-label="Blog pagination"
                        className="flex items-center justify-between gap-4 border-t border-foreground/5 pt-8 text-sm"
                    >
                        {page > 1 ? (
                            <Link
                                href={pageHref(page - 1)}
                                rel="prev"
                                className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-4 py-2 text-foreground/70 hover:text-foreground hover:border-foreground/20 transition"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Newer
                            </Link>
                        ) : (
                            <span />
                        )}

                        <span className="text-xs text-foreground/55">
                            Page {page} of {totalPages}
                        </span>

                        {page < totalPages ? (
                            <Link
                                href={pageHref(page + 1)}
                                rel="next"
                                className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-4 py-2 text-foreground/70 hover:text-foreground hover:border-foreground/20 transition"
                            >
                                Older
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                )}
            </div>
        </main>
    );
}
