import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools | GhostSweep Dashboard",
  description: "Access advanced privacy and data removal tools. Manage your digital footprint with powerful features.",
  keywords: [
    "privacy tools",
    "data removal tools",
    "advanced tools",
    "dashboard tools",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Tools | GhostSweep",
    description: "Advanced privacy and data removal tools.",
    url: "https://ghostsweep.com/dashboard/tools",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/tools",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
