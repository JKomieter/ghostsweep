import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";
import AnalyticsProvider from "@/components/analytics-provider";

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
        url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png", // Replace with your actual OG image
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-FZ706P051X"
        strategy="afterInteractive"
      />
      <Script id="ga-setup" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FZ706P051X', {
              page_path: window.location.pathname,
            });
          `}
      </Script>
      <body
        className={`${interSans.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SpeedInsights />
          <Analytics />
          <AnalyticsProvider >
            <main>{children}</main>
          </AnalyticsProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
