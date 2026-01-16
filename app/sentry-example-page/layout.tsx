import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sentry Example | Testing Error Tracking",
    description: "Sentry integration example page for testing error tracking and monitoring.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function SentryExampleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
