import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()

    return [
        // --- Main pages (highest priority) ---
        {
            url: 'https://www.ghostsweep.com/home',
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        
        // --- Feature/Service pages (high priority) ---
        {
            url: 'https://www.ghostsweep.com/home/breach_check',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: 'https://www.ghostsweep.com/home/how-it-works',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.85,
        },
        {
            url: 'https://www.ghostsweep.com/home/security',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.85,
        },

        // --- Content pages ---
        {
            url: 'https://www.ghostsweep.com/home/blogs',
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },

        // --- Legal/Policy pages ---
        {
            url: 'https://www.ghostsweep.com/home/privacy',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: 'https://www.ghostsweep.com/home/terms',
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.5,
        },

        // --- Support pages ---
        {
            url: 'https://www.ghostsweep.com/help',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: 'https://www.ghostsweep.com/support/report',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]
}