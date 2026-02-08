import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import FBPixel from "@/components/pixel-tracker";


const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "GhostSweep | Digital Privacy & Account Discovery Platform",
  description: "Visualize and reduce your Digital Shadow. GhostSweep finds forgotten accounts, identifies ghost subscriptions, recovers lost money, and secures your data from breaches.",
  keywords: [
    "GhostSweep",
    "digital shadow",
    "find hidden accounts",
    "forgotten accounts",
    "ghost subscriptions",
    "recover lost money",
    "email privacy",
    "data breach protection",
    "account cleanup",
    "digital footprint management",
  ],
  authors: [{ name: "GhostSweep" }],
  creator: "GhostSweep",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL("https://ghostsweep.com"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "GhostSweep | Reclaim Your Digital Shadow",
    description: "Discover forgotten accounts, recover lost money, and secure your personal data from breaches with GhostSweep.",
    url: "https://ghostsweep.com/home",
    type: "website",
    siteName: "GhostSweep",
    images: [
      {
        url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        width: 1200,
        height: 630,
        alt: "GhostSweep - Reclaim your Digital Shadow",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostSweep | Reclaim Your Digital Shadow",
    description: "Find hidden accounts and recover lost money with GhostSweep's digital privacy platform.",
    images: ["https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"],
    creator: "@ghostsweep",
  },
  alternates: {
    canonical: "https://ghostsweep.com/home",
  },
  appLinks: {
    ios: [
      {
        app_name: "GhostSweep",
        url: "https://ghostsweep.com",
      },
    ],
  },
};

/**
 * Security Note: Subresource Integrity (SRI)
 * 
 * This application does not use traditional SRI attributes because:
 * 
 * 1. Next.js Scripts (_next/static/):
 *    - Use content-addressed filenames (e.g., main-abc123.js)
 *    - Hash in filename serves as integrity check
 *    - More reliable than SRI attributes
 * 
 * 2. External Resources:
 *    - Vercel Analytics: Self-hosted (same-origin)
 *    - Vercel Speed Insights: Self-hosted (same-origin)
 *    - Google Fonts: Optimized and self-hosted by Next.js
 * 
 * 3. Additional Security:
 *    - Content Security Policy (see next.config.ts)
 *    - Strict-Transport-Security (HTTPS only)
 *    - X-Content-Type-Options: nosniff
 * 
 * See: https://nextjs.org/docs/architecture/nextjs-compiler
 */

// Organization Schema for Google Knowledge Panel
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GhostSweep",
  "url": "https://ghostsweep.com",
  "logo": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
  "description": "Privacy-first account discovery and digital footprint management platform.",
  "sameAs": [
    "https://twitter.com/ghostsweep",
    "https://www.instagram.com/ghostsweep",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "url": "https://ghostsweep.com/support",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <FBPixel />
      <body
        className={`${interSans.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Analytics - Self-hosted by Vercel (same-origin, no SRI needed) */}
          {process.env.NODE_ENV === "production" && (
            <>
              <SpeedInsights />
              <Analytics />
            </>
          )}

          <main>{children}</main>

          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}