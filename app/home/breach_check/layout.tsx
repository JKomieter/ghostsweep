import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Breach Checker | Check If Your Email Was Compromised | GhostSweep",
  description: "Free data breach checker tool. Scan if your email or domain appears in known security breaches. Powered by GhostSweep's breach detection engine. Instant results.",
  keywords: [
    "breach checker",
    "email breach check",
    "data breach search",
    "breach database",
    "email security check",
    "compromised email",
    "data breach detector",
    "email exposed",
    "breach notification",
    "security breach",
    "pwned email",
  ],
  openGraph: {
    title: "Data Breach Checker | Check If Your Email Was Compromised",
    description: "Free tool to check if your email or domain has been exposed in known data breaches.",
    url: "https://ghostsweep.com/home/breach_check",
    type: "website",
    images: [
      {
        url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        width: 1200,
        height: 630,
        alt: "GhostSweep Data Breach Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Breach Checker - Check If Your Email Was Compromised",
    description: "Free data breach checker. See if your email or domain appears in known security breaches.",
    images: ["https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"],
  },
  alternates: {
    canonical: "https://ghostsweep.com/home/breach_check",
  },
};

// JSON-LD Structured Data for Breach Checker Tool
const breachCheckerSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Data Breach Checker",
  "description": "Check if your email or domain appears in known data breaches.",
  "url": "https://ghostsweep.com/home/breach_check",
  "applicationCategory": "SecurityApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": {
    "@type": "Organization",
    "name": "GhostSweep",
    "logo": {
      "@type": "ImageObject",
      "url": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
    },
  },
};

export default function BreachCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breachCheckerSchema) }}
      />
      {children}
    </>
  );
}
