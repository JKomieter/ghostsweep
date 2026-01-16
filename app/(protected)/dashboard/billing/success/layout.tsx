import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Successful | GhostSweep",
  description: "Your GhostSweep subscription has been activated successfully. Start managing your digital footprint.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Subscription Successful | GhostSweep",
    description: "Your subscription is now active.",
    url: "https://ghostsweep.com/dashboard/billing/success",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/billing/success",
  },
};

export default function BillingSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
