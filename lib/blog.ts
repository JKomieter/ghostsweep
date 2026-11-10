import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createServerClient } from "@supabase/ssr";

/**
 * Blog data access.
 *
 * Blog posts are public, so we query with a cookie-less Supabase client. That
 * keeps the queries independent of the incoming request, which lets Next.js
 * cache them (unstable_cache) instead of hitting Supabase on every page view.
 *
 * To publish changes immediately, call `revalidateTag(BLOG_CACHE_TAG, "max")`
 * from a server action / route handler; otherwise caches refresh hourly.
 */

export const BLOG_CACHE_TAG = "blog-posts";
export const BLOG_PAGE_SIZE = 12;
const REVALIDATE_SECONDS = 3600;

const LIST_COLUMNS =
    "id, slug, title, excerpt, category, cover_image_url, reading_time, published_at";
const DETAIL_COLUMNS = `${LIST_COLUMNS}, content_md`;

export type BlogPostSummary = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    category: string | null;
    cover_image_url: string | null;
    reading_time: number | null;
    published_at: string | null;
};

export type BlogPost = BlogPostSummary & {
    content_md: string | null;
};

export type BlogPage = {
    posts: BlogPostSummary[];
    total: number;
    page: number;
    totalPages: number;
};

function publicClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
    );
}

/** One page of published posts, newest first, plus the total count. */
export const getBlogPage = unstable_cache(
    async (page: number, pageSize: number = BLOG_PAGE_SIZE): Promise<BlogPage> => {
        const safePage = Math.max(1, Math.floor(page) || 1);
        const from = (safePage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await publicClient()
            .from("blog_posts")
            .select(LIST_COLUMNS, { count: "exact" })
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .range(from, to);

        if (error) {
            // PGRST103: requested range is past the end — treat as an empty page.
            if (error.code !== "PGRST103") {
                console.error("[blog] Failed to fetch blog page:", error);
            }
            return { posts: [], total: count ?? 0, page: safePage, totalPages: 0 };
        }

        const total = count ?? 0;
        return {
            posts: (data ?? []) as BlogPostSummary[],
            total,
            page: safePage,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
    },
    ["blog-page"],
    { revalidate: REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] }
);

/** The N most recent published posts (used on the homepage). */
export const getLatestPosts = unstable_cache(
    async (limit: number = 3): Promise<BlogPostSummary[]> => {
        const { data, error } = await publicClient()
            .from("blog_posts")
            .select(LIST_COLUMNS)
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("[blog] Failed to fetch latest posts:", error);
            return [];
        }
        return (data ?? []) as BlogPostSummary[];
    },
    ["blog-latest"],
    { revalidate: REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] }
);

const getPostBySlugCached = unstable_cache(
    async (slug: string): Promise<BlogPost | null> => {
        const { data, error } = await publicClient()
            .from("blog_posts")
            .select(DETAIL_COLUMNS)
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();

        if (error) console.error("[blog] Failed to fetch post:", error);
        return (data as BlogPost | null) ?? null;
    },
    ["blog-post"],
    { revalidate: REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] }
);

/**
 * A single published post. Wrapped in React `cache` so generateMetadata and
 * the page share one lookup per request.
 */
export const getPostBySlug = cache((slug: string) => getPostBySlugCached(slug));

export function formatBlogDate(dateStr: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
