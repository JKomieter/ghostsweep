import type { MetadataRoute } from 'next'
import { createServerClient } from '@supabase/ssr'

const SITE_URL = 'https://www.ghostsweep.com'

// Regenerate the sitemap at most once per hour so new posts get picked up.
export const revalidate = 3600

type StaticPage = {
    path: string
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
    priority: number
}

const STATIC_PAGES: StaticPage[] = [
    // --- Main pages (highest priority) ---
    { path: '/home', changeFrequency: 'weekly', priority: 1.0 },

    // --- Feature/Service pages (high priority) ---
    { path: '/home/breach_check', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/home/how-it-works', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/home/security', changeFrequency: 'monthly', priority: 0.85 },

    // --- Content pages ---
    { path: '/home/blogs', changeFrequency: 'weekly', priority: 0.7 },

    // --- Legal/Policy pages ---
    { path: '/home/privacy', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/home/terms', changeFrequency: 'yearly', priority: 0.5 },

    // --- Support pages ---
    { path: '/help', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/support/report', changeFrequency: 'monthly', priority: 0.5 },
]

async function getBlogPostEntries(): Promise<MetadataRoute.Sitemap> {
    // Cookie-less client: the sitemap is public and must not depend on request cookies.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data, error } = await supabase
        .from('blog_posts')
        .select('slug, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

    if (error) {
        console.error('[sitemap] Failed to fetch blog posts:', error)
        return []
    }

    return (data ?? [])
        .filter((post) => post.slug)
        .map((post) => ({
            url: `${SITE_URL}/home/blogs/${post.slug}`,
            lastModified: post.published_at ? new Date(post.published_at) : undefined,
            changeFrequency: 'monthly' as const,
            priority: 0.65,
        }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()

    const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
        url: `${SITE_URL}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
    }))

    let blogEntries: MetadataRoute.Sitemap = []
    try {
        blogEntries = await getBlogPostEntries()
    } catch (error) {
        console.error('[sitemap] Unexpected error fetching blog posts:', error)
    }

    return [...staticEntries, ...blogEntries]
}
