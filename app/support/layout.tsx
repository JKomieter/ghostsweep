import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Report an Issue | GhostSweep Support",
    description: "Report a bug or issue with GhostSweep. Help us improve by sharing your feedback and technical details.",
    keywords: [
        "report bug",
        "support",
        "issue report",
        "contact support",
        "bug report",
        "feedback",
    ],
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: "Report an Issue | GhostSweep Support",
        description: "Help us improve by reporting bugs or issues.",
        url: "https://ghostsweep.com/support/report",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/support/report",
    },
};

export default function ReportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
