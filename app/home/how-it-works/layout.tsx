import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How It Works | GhostSweep Account Discovery Process Explained",
    description: "Learn how GhostSweep discovers forgotten accounts, detects data breaches, and helps you manage your digital footprint. Privacy-first scanning process.",
    keywords: [
        "how ghostsweep works",
        "account discovery process",
        "email scanning",
        "forgotten account finder",
        "digital footprint management",
        "breach detection",
        "account cleanup process",
        "privacy protection",
        "data removal process",
        "email security process",
    ],
    openGraph: {
        title: "How It Works | GhostSweep Account Discovery Process",
        description: "Understand how GhostSweep safely discovers your forgotten accounts and helps secure your digital presence.",
        url: "https://ghostsweep.com/home/how-it-works",
        type: "website",
        images: [
            {
                url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
                width: 1200,
                height: 630,
                alt: "How GhostSweep Works",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "How GhostSweep Works - Account Discovery & Breach Detection",
        description: "See how GhostSweep finds forgotten accounts and manages your digital footprint securely.",
        images: ["https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"],
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/how-it-works",
    },
};

// JSON-LD Structured Data for How It Works
const howItWorksSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How GhostSweep Works",
  "description": "Step-by-step guide to discovering forgotten accounts and managing your digital footprint.",
  "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Connect Your Email",
      "text": "Securely connect your email account using Google OAuth."
    },
    {
      "@type": "HowToStep",
      "name": "Scan for Accounts",
      "text": "GhostSweep scans email metadata to find accounts linked to your email."
    },
    {
      "@type": "HowToStep",
      "name": "Review Results",
      "text": "See all discovered accounts and check for data breaches."
    },
    {
      "@type": "HowToStep",
      "name": "Manage Access",
      "text": "Update passwords, enable 2FA, or delete accounts you no longer use."
    }
  ]
};

export default function HowItWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }}
            />
            {children}
        </>
    );
    return children;
}
