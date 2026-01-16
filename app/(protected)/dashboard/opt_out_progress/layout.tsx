import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opt-Out Requests | GhostSweep",
  description: "Track your data removal requests. Monitor the status of opt-out requests sent to data brokers and marketing companies.",
  keywords: [
    "opt-out",
    "data removal",
    "data broker",
    "privacy requests",
    "opt out requests",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Opt-Out Requests | GhostSweep",
    description: "Manage data removal and opt-out requests.",
    url: "https://ghostsweep.com/dashboard/opt_out_progress",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/opt_out_progress",
  },
};

export default function OptOutProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
