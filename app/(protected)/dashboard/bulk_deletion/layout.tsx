import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Deletion | GhostSweep Dashboard",
  description: "Efficiently delete multiple accounts at once. Speed up your digital cleanup process by sending bulk deletion requests to services.",
  keywords: [
    "bulk deletion",
    "mass deletion",
    "account deletion",
    "bulk removal",
    "account cleanup",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Bulk Deletion | GhostSweep",
    description: "Delete multiple accounts efficiently.",
    url: "https://ghostsweep.com/dashboard/bulk_deletion",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/bulk_deletion",
  },
};

export default function BulkDeletionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
