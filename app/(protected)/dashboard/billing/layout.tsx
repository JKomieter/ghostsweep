import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Subscription | GhostSweep",
  description: "Manage your GhostSweep subscription, view billing history, and update payment information.",
  keywords: [
    "billing",
    "subscription",
    "payment",
    "account billing",
    "invoice",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Billing & Subscription | GhostSweep",
    description: "Manage your subscription and billing.",
    url: "https://ghostsweep.com/dashboard/billing",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/billing",
  },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
