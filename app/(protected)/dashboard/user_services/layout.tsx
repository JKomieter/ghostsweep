import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Connected Services | GhostSweep Dashboard",
  description: "View and manage all services connected to your email. See your digital footprint across platforms and track security risks.",
  keywords: [
    "connected services",
    "email services",
    "linked accounts",
    "digital footprint",
    "account management",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Your Connected Services | GhostSweep",
    description: "Manage services and accounts linked to your email.",
    url: "https://ghostsweep.com/dashboard/user_services",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/user_services",
  },
};

export default function UserServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
