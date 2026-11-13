import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Serves company logos from logo.dev without exposing the logo.dev key in browser URLs.
// The key is only read here on the server and never shipped to the client.

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Generous: a dashboard table can load a few hundred logos, and repeat requests are served by the CDN cache
const logoRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(600, "1 m"),
    prefix: "ratelimit:logo",
});

// Hostnames only (e.g. "netflix.com"), so the upstream URL can't be redirected or path-injected
const DOMAIN_REGEX = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

const CACHE_HIT = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
const CACHE_MISS = "public, max-age=3600, s-maxage=86400";

export async function GET(request: NextRequest, { params }: { params: Promise<{ domain: string }> }) {
    const domain = decodeURIComponent((await params).domain).trim().toLowerCase();
    if (!DOMAIN_REGEX.test(domain)) {
        return new NextResponse(null, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = await logoRateLimit.limit(ip);
    if (!success) {
        return new NextResponse(null, { status: 429, headers: { "Retry-After": "60" } });
    }

    const key = process.env.LOGO_DEV_KEY ?? process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
    if (!key) {
        return new NextResponse(null, { status: 404 });
    }

    try {
        // fallback=404 makes logo.dev return 404 for unknown companies, so the UI shows its own initials
        const upstream = await fetch(
            `https://img.logo.dev/${domain}?token=${encodeURIComponent(key)}&size=64&format=png&fallback=404`,
            { signal: AbortSignal.timeout(5000) }
        );

        const contentType = upstream.headers.get("content-type") ?? "";
        if (!upstream.ok || !contentType.startsWith("image/")) {
            return new NextResponse(null, { status: 404, headers: { "Cache-Control": CACHE_MISS } });
        }

        return new NextResponse(await upstream.arrayBuffer(), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": CACHE_HIT,
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch {
        return new NextResponse(null, { status: 404 });
    }
}
