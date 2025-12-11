import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis with environment variables
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a new ratelimiter, that allows 5 requests per 5 seconds
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(5, "5 s"),
});

export async function proxy(request: NextRequest) {
    // Get IP address for rate limiting
    const ip =  request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Apply rate limiting
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    // Create response (either from redirect or session update)
    let response: NextResponse;

    // Handle root path redirect
    if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        response = NextResponse.redirect(url)
    } else {
        // Update session for all other paths
        response = await updateSession(request)
    }

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())

    // If rate limit exceeded, return 429 response
    if (!success) {
        return new NextResponse(
            JSON.stringify({
                error: 'Too Many Requests',
                message: 'You have exceeded the rate limit. Please try again later.',
                rateLimitState: {
                    limit,
                    remaining,
                    reset
                }
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString(),
                }
            }
        )
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api routes (optional - remove if you want to rate limit API)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}