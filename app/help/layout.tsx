import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support | GhostSweep",
  description: "Get help with GhostSweep. Find answers to common questions about account discovery, privacy protection, and digital security.",
  keywords: [
    "help",
    "support",
    "faq",
    "ghost sweep help",
    "customer support",
  ],
  openGraph: {
    title: "Help & Support | GhostSweep",
    description: "Find help and answers to questions about GhostSweep.",
    url: "https://ghostsweep.com/help",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/help",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
