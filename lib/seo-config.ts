/**
 * SEO Configuration and Constants
 * Centralized metadata and structured data for consistent SEO across the application
 */

export const SITE_CONFIG = {
  siteName: "GhostSweep",
  siteUrl: "https://ghostsweep.com",
  description: "Privacy-first account discovery and digital footprint management platform",
  image: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
  twitterHandle: "@ghostsweep",
  author: "GhostSweep",
};

export const STRUCTURED_DATA = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GhostSweep",
    url: SITE_CONFIG.siteUrl,
    logo: SITE_CONFIG.image,
    description: SITE_CONFIG.description,
    sameAs: [
      "https://twitter.com/ghostsweep",
      "https://instagram.com/ghostsweep",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      url: `${SITE_CONFIG.siteUrl}/support`,
    },
  },

  breachChecker: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Data Breach Checker",
    description: "Check if your email or domain appears in known data breaches",
    url: `${SITE_CONFIG.siteUrl}/home/breach_check`,
    applicationCategory: "SecurityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.siteName,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.image,
      },
    },
  },

  howItWorks: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How GhostSweep Works",
    description: "Step-by-step guide to discovering forgotten accounts and managing your digital footprint",
    image: SITE_CONFIG.image,
    step: [
      {
        "@type": "HowToStep",
        name: "Connect Your Email",
        text: "Securely connect your email account using Google OAuth",
      },
      {
        "@type": "HowToStep",
        name: "Scan for Accounts",
        text: "GhostSweep scans email metadata to find accounts linked to your email",
      },
      {
        "@type": "HowToStep",
        name: "Review Results",
        text: "See all discovered accounts and check for data breaches",
      },
      {
        "@type": "HowToStep",
        name: "Manage Access",
        text: "Update passwords, enable 2FA, or delete accounts you no longer use",
      },
    ],
  },

  blog: {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "GhostSweep Blog",
    description: "Privacy, security, and digital footprint management insights",
    url: `${SITE_CONFIG.siteUrl}/home/blogs`,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.siteName,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.image,
      },
    },
  },
};

export const SEO_KEYWORDS = {
  primary: [
    "find hidden accounts",
    "email scanner",
    "account discovery",
    "data breach detection",
    "digital footprint",
  ],
  secondary: [
    "privacy tools",
    "account cleanup",
    "email security",
    "forgotten accounts",
    "data removal",
  ],
  tools: [
    "breach checker",
    "email breach check",
    "data breach search",
    "email security check",
  ],
};

export const PAGE_METADATA = {
  home: {
    title: "Find Hidden Accounts & Manage Your Digital Footprint | GhostSweep",
    description: "Scan your inbox to discover forgotten accounts, detect data breaches, and take control of where your information lives. Privacy-first account discovery tool.",
    keywords: [
      ...SEO_KEYWORDS.primary,
      ...SEO_KEYWORDS.secondary,
    ],
  },
  breachCheck: {
    title: "Data Breach Checker | Check If Your Email Was Compromised | GhostSweep",
    description: "Free data breach checker tool. Scan if your email or domain appears in known security breaches. Powered by GhostSweep's breach detection engine. Instant results.",
    keywords: [
      ...SEO_KEYWORDS.tools,
      "compromised email",
      "data breach detector",
      "email exposed",
      "breach notification",
    ],
  },
  howItWorks: {
    title: "How It Works | GhostSweep Account Discovery Process Explained",
    description: "Learn how GhostSweep discovers forgotten accounts, detects data breaches, and helps you manage your digital footprint. Privacy-first scanning process.",
    keywords: [
      "how ghostsweep works",
      "account discovery process",
      "email scanning",
      "privacy protection",
    ],
  },
  security: {
    title: "Security & Privacy | How GhostSweep Protects Your Data",
    description: "Learn how GhostSweep securely scans your email using metadata-only analysis, Google OAuth, and privacy-first design. CASA certified and Google verified.",
    keywords: [
      "email security",
      "privacy protection",
      "OAuth security",
      "data privacy",
      "CCPA compliant",
      "GDPR compliant",
    ],
  },
  privacy: {
    title: "Privacy Policy | GhostSweep Data Protection",
    description: "Read GhostSweep's comprehensive privacy policy. Learn what data we collect, how we protect it, and how you maintain control over your information.",
    keywords: [
      "privacy policy",
      "data protection",
      "user data",
      "GDPR",
      "CCPA",
    ],
  },
  terms: {
    title: "Terms of Service | GhostSweep",
    description: "Read GhostSweep's Terms of Service. Understand the rules and guidelines for using our privacy-first account discovery and management platform.",
    keywords: [
      "terms of service",
      "terms and conditions",
      "user agreement",
    ],
  },
  blogs: {
    title: "Blog | Privacy Tips, Security Insights & Digital Footprint Management | GhostSweep",
    description: "Read expert articles on data privacy, digital security, email safety, and managing your online accounts. Stay informed about protecting your digital presence.",
    keywords: [
      "privacy blog",
      "security tips",
      "email security",
      "digital footprint",
    ],
  },
  dashboard: {
    title: "Dashboard | GhostSweep Account Management",
    description: "Manage your digital footprint. View discovered accounts, monitor data breaches, and control your online presence.",
    keywords: [],
  },
};

export const OG_IMAGE = {
  url: SITE_CONFIG.image,
  width: 1200,
  height: 630,
  type: "image/png",
};

export const ROBOTS_CONFIG = {
  publicPages: {
    index: true,
    follow: true,
  },
  privatePages: {
    index: false,
    follow: false,
  },
};
