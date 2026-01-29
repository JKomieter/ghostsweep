import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    })

    return config
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'znlaksqttxokoeavwqjf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: "https",
        hostname: "ghostsweep.t3.storage.dev",
        port: '',
      },
      {
        protocol: "https",
        hostname: "img.logo.dev",
        port: '',
        pathname: "/**"
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },

  async headers() {
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      {
        key: 'Content-Security-Policy',
        value: process.env.NODE_ENV === "development"
          ? // DEVELOPMENT CSP (permissive)
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://va.vercel-scripts.com https://connect.facebook.net https://js.hcaptcha.com https://hcaptcha.com *.hcaptcha.com", // ✅ Added Facebook & hCaptcha
            "style-src 'self' 'unsafe-inline' https://hcaptcha.com *.hcaptcha.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' ws: wss: https://api.anthropic.com https://accounts.google.com https://oauth2.googleapis.com https://gmail.googleapis.com https://va.vercel-scripts.com https://*.supabase.co https://www.facebook.com https://connect.facebook.net https://hcaptcha.com *.hcaptcha.com", // ✅ Added Facebook & hCaptcha
            "worker-src 'self' blob:",
            "frame-src 'self' https://accounts.google.com https://www.youtube.com https://hcaptcha.com *.hcaptcha.com",
          ].join("; ")
          : // PRODUCTION CSP (strict)
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://va.vercel-scripts.com https://connect.facebook.net https://js.hcaptcha.com https://hcaptcha.com *.hcaptcha.com", // ✅ Added Facebook & hCaptcha
            "style-src 'self' 'unsafe-inline' https://hcaptcha.com *.hcaptcha.com",
            "img-src 'self' data: https: https://www.facebook.com",
            "font-src 'self' data:",
            "connect-src 'self' https://api.anthropic.com https://accounts.google.com https://oauth2.googleapis.com https://gmail.googleapis.com https://va.vercel-scripts.com https://*.supabase.co https://www.facebook.com https://connect.facebook.net https://hcaptcha.com *.hcaptcha.com", // ✅ Added Facebook & hCaptcha
            "worker-src 'self' blob:",
            "frame-src 'self' https://accounts.google.com https://www.youtube.com https://hcaptcha.com *.hcaptcha.com",
          ].join("; "),
      },
      {
        key: 'Server',
        value: '',
      },
    ];

    return [
      // Public marketing pages - can be cached
      {
        source: '/home/:path((?!breach_check).*)*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // Authentication pages - NEVER cache
      {
        source: '/login',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/forgot_password',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/reset_password',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Dashboard - NEVER cache (user-specific)
      {
        source: '/dashboard/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // API routes - NEVER cache
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Breach check page - NEVER cache (user input)
      {
        source: '/home/breach_check',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Static assets - can cache aggressively
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Default - private cache for everything else
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'private, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "joel-adjetey-komieter",
  project: "ghostsweep",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});