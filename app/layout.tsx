import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Find Hidden Accounts & Manage Your Digital Footprint | GhostSweep",
  description: "Scan your inbox to discover forgotten accounts, detect data breaches, and take control of where your information lives. Privacy-first account discovery tool.",
  keywords: [
    "find hidden accounts",
    "email scanner",
    "account discovery",
    "data breach detection",
    "digital footprint",
    "privacy tools",
    "account cleanup",
    "email security",
    "forgotten accounts",
    "data removal",
  ],
  openGraph: {
    title: "Find Hidden Accounts & Manage Your Digital Footprint | GhostSweep",
    description: "Discover forgotten accounts linked to your email and take control of your digital presence.",
    url: "https://ghostsweep.com/home",
    type: "website",
    images: [
      {
        url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        width: 1200,
        height: 630,
        alt: "GhostSweep - Find your hidden accounts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Hidden Accounts & Manage Your Digital Footprint | GhostSweep",
    description: "Discover forgotten accounts and secure your digital presence.",
    images: ["https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"],
  },
  alternates: {
    canonical: "https://ghostsweep.com/home",
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
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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