import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLatestPosts } from "@/lib/blog";
import { BlogPostCard } from "@/components/blog-post-card";

/** Server component: the 3 most recent posts, rendered into the homepage. */
export default async function LatestBlogs() {
    const posts = await getLatestPosts(3);
    if (posts.length === 0) return null;

    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10" id="blog">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 mb-4">
                            From the blog
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                            Latest privacy insights
                        </h2>
                    </div>
                    <Link
                        href="/home/blogs"
                        className="group inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition"
                    >
                        View all articles
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {posts.map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </section>
    );
}
