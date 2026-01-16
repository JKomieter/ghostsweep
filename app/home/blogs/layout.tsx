import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Privacy Tips, Security Insights & Digital Footprint Management | GhostSweep",
  description: "Read expert articles on data privacy, digital security, email safety, and managing your online accounts. Stay informed about protecting your digital presence.",
  keywords: [
    "privacy blog",
    "security tips",
    "email security",
    "data privacy",
    "digital footprint",
    "account management",
    "privacy guides",
    "cybersecurity",
    "online privacy",
    "data protection",
    "forgotten accounts",
  ],
  openGraph: {
    title: "Blog | Privacy Tips & Digital Security Insights | GhostSweep",
    description: "Expert articles on data privacy, security, and managing your digital footprint.",
    url: "https://ghostsweep.com/home/blogs",
    type: "website",
    images: [
      {
        url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        width: 1200,
        height: 630,
        alt: "GhostSweep Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Privacy & Security Tips | GhostSweep",
    description: "Expert insights on protecting your privacy and managing your digital presence.",
    images: ["https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"],
  },
  alternates: {
    canonical: "https://ghostsweep.com/home/blogs",
  },
};

// JSON-LD Blog Schema
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "GhostSweep Blog",
  "description": "Privacy, security, and digital footprint management insights.",
  "url": "https://ghostsweep.com/home/blogs",
  "publisher": {
    "@type": "Organization",
    "name": "GhostSweep",
    "logo": {
      "@type": "ImageObject",
      "url": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
    },
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {children}
    </>
  );
}
