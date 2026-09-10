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
    limiter: Ratelimit.slidingWindow(300, '1 m'),
    analytics: false,  // Disabled to reduce Redis calls
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

    // Rate limiting — skip for API routes (each has its own auth check or
    // dedicated rate limiter; the global cap only protects page/HTML routes
    // against bots and scrapers).
    const isApiRoute = pathname.startsWith('/api/');
    if (!isApiRoute && !WHITELISTED_IPS.includes(ip)) {
        const { success, limit, remaining, reset } = await ratelimit.limit(ip);
        if (!success) {
            const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
            
            // Check if it's a browser request for a page
            const accept = request.headers.get('accept');
            if (accept && accept.includes('text/html')) {
                return new NextResponse(
                    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>High Demand | GhostSweep</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #050505; color: white; }
        @keyframes subtle-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .premium-loader { animation: subtle-pulse 2s infinite ease-in-out; }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full text-center space-y-8">
        <div class="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/60 premium-loader"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
        </div>
        <div class="space-y-4">
            <h1 class="text-2xl font-light tracking-tight text-white/90">Premium Experience Protection</h1>
            <p class="text-white/50 text-sm leading-relaxed font-light px-4">
                GhostSweep is currently managing a high volume of requests to maintain the highest quality of service. We appreciate your patience as we ensure the best experience for all our members.
            </p>
        </div>
        <div class="pt-8 max-w-[240px] mx-auto">
            <div id="countdown" class="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4 font-light">Ready in ${retryAfterSeconds}s</div>
            <div class="h-[1px] w-full bg-white/10 rounded-full overflow-hidden">
                <div id="progress" class="h-full bg-white/40 transition-all duration-1000 ease-linear" style="width: 0%"></div>
            </div>
        </div>
        <div class="pt-8">
            <button onclick="window.location.reload()" class="text-[11px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors duration-300">
                Refresh manually
            </button>
        </div>
        <script>
            let timeLeft = ${retryAfterSeconds};
            const countdownEl = document.getElementById('countdown');
            const progressEl = document.getElementById('progress');
            const totalTime = ${retryAfterSeconds};
            
            const timer = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    countdownEl.textContent = 'Restarting now...';
                    window.location.reload();
                } else {
                    countdownEl.textContent = 'Ready in ' + timeLeft + 's';
                    progressEl.style.width = ((totalTime - timeLeft) / totalTime * 100) + '%';
                }
            }, 1000);
            
            setTimeout(() => { progressEl.style.width = '10%'; }, 50);
        </script>
    </div>
</body>
</html>`,
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'text/html',
                            'Retry-After': String(retryAfterSeconds),
                            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        }
                    }
                );
            }

            return NextResponse.json(
                {
                    code: "RATE_LIMITED",
                    error: "Too Many Requests",
                    message: "We're currently handling a high volume of requests to ensure the best experience for our members. Please take a breath and try again shortly.",
                    retryAfterSeconds,
                    rateLimitState: {
                        limit,
                        remaining,
                        reset: new Date(reset).toISOString(),
                    },
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": String(limit),
                        "X-RateLimit-Remaining": String(remaining),
                        "X-RateLimit-Reset": String(reset),
                        "Retry-After": String(retryAfterSeconds),
                        "Cache-Control": "no-cache, no-store, must-revalidate, private",
                        "X-Content-Type-Options": "nosniff",
                        "Server": "",
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

    if (pathname.includes("unsubscribe")) {
        const url = request.nextUrl.clone();
        url.pathname = '/home/unsubscribe';
        return NextResponse.redirect(url);
    }

    if (pathname.includes("support")) {
        const url = request.nextUrl.clone();
        url.pathname = '/home/support';
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