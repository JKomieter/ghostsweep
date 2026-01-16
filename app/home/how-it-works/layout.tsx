import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How GhostSweep Works | Email Scan to Account Cleanup",
    description: "Step-by-step guide: Connect Gmail, scan metadata to find hidden accounts, and delete services you don't want. Privacy-first account discovery.",
    keywords: [
        "how ghostsweep works",
        "email account discovery",
        "account cleanup process",
        "gmail metadata scanning",
        "account deletion",
        "digital footprint cleanup",
        "privacy workflow",
    ],
    openGraph: {
        title: "How GhostSweep Works | Email Scan to Account Cleanup",
        description: "See exactly how GhostSweep scans your Gmail metadata to find forgotten accounts and helps you delete them.",
        url: "https://ghostsweep.com/home/how-it-works",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/how-it-works",
    },
};

export default function HowItWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
