import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Removal Tools | GhostSweep",
  description: "Advanced tools for removing your data from websites and data brokers. Manage your data removal requests.",
  keywords: [
    "data removal",
    "data removal tools",
    "privacy tools",
    "data broker removal",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Data Removal Tools | GhostSweep",
    description: "Remove your data from data brokers and websites.",
    url: "https://ghostsweep.com/dashboard/tools/data_removal",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/tools/data_removal",
  },
};

export default function DataRemovalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
