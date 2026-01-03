import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { geolocation } from '@vercel/functions';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
});

const ALLOWED_ORIGINS = [
    'https://ghostsweep.com',
    'https://www.ghostsweep.com',
    'http://localhost:3000',
    'http://localhost:3001',
];

const BLOCKED_COUNTRIES = ['CN', 'RU', 'KP'];
const WHITELISTED_IPS = ['127.0.0.1', '192.168.1.1'];

function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return true;
    return ALLOWED_ORIGINS.includes(origin);
}

function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP.trim();
    }

    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
        return cfConnectingIP.trim();
    }

    const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
    if (vercelForwardedFor) {
        return vercelForwardedFor.split(',')[0].trim();
    }

    return '127.0.0.1';
}

function addSecurityHeaders(response: NextResponse, pathname: string): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');

    if (!response.headers.has('X-Frame-Options')) {
        response.headers.set('X-Frame-Options', 'DENY');
    }
    if (!response.headers.has('X-XSS-Protection')) {
        response.headers.set('X-XSS-Protection', '1; mode=block');
    }
    if (!response.headers.has('Referrer-Policy')) {
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    response.headers.delete('X-Powered-By');
    response.headers.delete('x-powered-by');
    response.headers.set('Server', '');

    const isAuthPage = ['/login', '/forgot_password', '/reset_password', '/signup'].some(p => pathname.startsWith(p));
    const isDashboard = pathname.startsWith('/dashboard');
    const isAPI = pathname.startsWith('/api');
    const isBreachCheck = pathname === '/home/breach_check';

    if (isAuthPage || isDashboard || isAPI || isBreachCheck) {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    } else if (!response.headers.has('Cache-Control')) {
        response.headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
    }

    return response;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;
    const origin = request.headers.get('origin');
    const ip = getClientIP(request);
    
    // Bypass middleware for webhooks
    if (pathname.startsWith('/api/webhooks/')) {
        console.log(`⚡ Webhook request bypassing middleware: ${pathname}`);
        return NextResponse.next();
    }

    // Block dangerous HTTP methods
    const BLOCKED_METHODS = ['TRACE', 'TRACK'];
    if (BLOCKED_METHODS.includes(method)) {
        console.warn(`❌ Blocked ${method} request from IP: ${ip}`);
        return new NextResponse(
            JSON.stringify({
                error: 'Method Not Allowed',
                message: `The ${method} method is not allowed`,
            }),
            {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Allow': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
                    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
                    'X-Content-Type-Options': 'nosniff',
                    'Server': '',
                },
            }
        );
    }

    // Handle OPTIONS (CORS preflight)
    if (method === 'OPTIONS') {
        const isCORSPreflight = origin && request.headers.get('access-control-request-method');
        if (!isCORSPreflight) {
            console.warn(`❌ Blocked OPTIONS fingerprinting attempt from IP: ${ip}`);
            return new NextResponse(null, {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Allow': 'GET, POST, PUT, PATCH, DELETE, HEAD',
                    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
                    'X-Content-Type-Options': 'nosniff',
                    'Server': '',
                },
            });
        }

        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin || '',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
                'Cache-Control': 'no-cache, no-store, must-revalidate, private',
                'X-Content-Type-Options': 'nosniff',
                'Server': '',
            },
        });
    }

    // Skip checks for static assets
    if (
        pathname.startsWith('/_next/static') ||
        pathname.startsWith('/_next/image') ||
        pathname.includes('.')
    ) {
        const response = NextResponse.next();
        return addSecurityHeaders(response, pathname);
    }

    // 🔥 FIXED: Make origin check more lenient for auth pages
    if (!isOriginAllowed(origin) 
        // && !pathname.startsWith('/api/auth/')
    ) {
        console.warn(`❌ Blocked request from unauthorized origin: ${origin}`);
        return new NextResponse(
            JSON.stringify({
                error: 'Forbidden',
                message: 'Access denied: Invalid origin',
            }),
            {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
                    'X-Content-Type-Options': 'nosniff',
                    'Server': '',
                },
            }
        );
    }

    // Geo-blocking
    const { country } = geolocation(request);
    if (country && BLOCKED_COUNTRIES.includes(country)) {
        console.warn(`❌ Blocked request from country: ${country}`);
        return new NextResponse(
            JSON.stringify({
                error: 'Forbidden',
                message: 'Access denied: Service not available in your region',
            }),
            {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
                    'X-Content-Type-Options': 'nosniff',
                    'Server': '',
                },
            }
        );
    }

    // Rate limiting
    if (!WHITELISTED_IPS.includes(ip)) {
        const { success, limit, remaining, reset } = await ratelimit.limit(ip);

        if (!success) {
            console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
            return new NextResponse(
                JSON.stringify({
                    error: 'Too Many Requests',
                    message: 'You have exceeded the rate limit. Please try again later.',
                    rateLimitState: {
                        limit,
                        remaining,
                        reset: new Date(reset).toISOString(),
                    },
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
                        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
                        'X-Content-Type-Options': 'nosniff',
                        'Server': '',
                    },
                }
            );
        }
    }

    // redirect to /home if root path is accessed
    if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/home';
        return NextResponse.redirect(url);
    }

    // Update session
    const response = await updateSession(request);

    // Add security headers
    const secureResponse = addSecurityHeaders(response, pathname);

    // Add IP to response headers (development only)
    if (process.env.NODE_ENV === 'development') {
        secureResponse.headers.set('X-Client-IP', ip);
    }

    return secureResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|monitoring|api/webhooks/stripe|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};