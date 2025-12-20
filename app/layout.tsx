import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GhostSweep — Protect Your Digital Footprint",
  description:
    "GhostSweep helps you uncover hidden accounts, detect breaches, and take control of where your data lives. Scan your inbox, review connected services, and secure your digital presence with privacy-first tools.",
  keywords: [
    "privacy",
    "data security",
    "email scanner",
    "breach detection",
    "account cleanup",
    "digital footprint",
    "inbox scanner",
    "account discovery",
    "privacy tools",
  ],
  openGraph: {
    title: "GhostSweep — Protect Your Digital Footprint",
    description:
      "Scan your inbox, uncover hidden services, detect breaches, and take control of your data exposure.",
    url: "https://ghostsweep.com",
    siteName: "GhostSweep",
    images: [
      {
        url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        width: 1200,
        height: 630,
        alt: "GhostSweep — Privacy Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostSweep — Protect Your Digital Footprint",
    description:
      "Uncover hidden accounts, detect breaches, and secure your personal data.",
    images: ["https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"],
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