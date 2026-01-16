import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Email Preferences | GhostSweep Unsubscribe",
    description: "Manage your GhostSweep email preferences. Unsubscribe from non-essential emails while keeping important security notifications.",
    keywords: [
        "unsubscribe",
        "email preferences",
        "manage emails",
        "email management",
    ],
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: "Manage Email Preferences | GhostSweep",
        description: "Control which emails you receive from GhostSweep.",
        url: "https://ghostsweep.com/home/unsubscribe",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/unsubscribe",
    },
};

export default function UnsubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
