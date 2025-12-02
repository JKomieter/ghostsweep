import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()

    return [
        // --- Main pages ---
        {
            url: 'https://www.ghostsweep.com/home',
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://www.ghostsweep.com/login',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.ghostsweep.com/home/how-it-works',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.ghostsweep.com/home/security',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.ghostsweep.com/home/breach-check',
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },

        // --- Content pages ---
        {
            url: 'https://www.ghostsweep.com/home/blogs',
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.6,
        },

        // --- Legal pages ---
        {
            url: 'https://www.ghostsweep.com/home/privacy',
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: 'https://www.ghostsweep.com/home/terms',
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]
}