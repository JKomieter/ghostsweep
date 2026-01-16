import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deletion Requests | GhostSweep Account Management",
  description: "Track and manage your account deletion requests. Monitor the status of deletion emails sent to services and manage your digital removal process.",
  keywords: [
    "deletion requests",
    "account deletion",
    "deletion status",
    "account removal",
    "digital footprint",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Deletion Requests | GhostSweep",
    description: "Manage your account deletion requests and track removal status.",
    url: "https://ghostsweep.com/dashboard/deletion_requests",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/deletion_requests",
  },
};

export default function DeletionRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
