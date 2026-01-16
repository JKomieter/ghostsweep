import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

// Dynamic metadata generation based on service ID
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Manage Service ${id} | GhostSweep`,
    description: `Manage your service account. Check security status, view activity, and control deletion options for this service.`,
    keywords: [
      "service management",
      "account management",
      "connected services",
      "service control",
    ],
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `Manage Service ${id} | GhostSweep`,
      description: `Control your service account settings and security.`,
      url: `https://ghostsweep.com/dashboard/user_services/${id}`,
      type: "website",
    },
    alternates: {
      canonical: `https://ghostsweep.com/dashboard/user_services/${id}`,
    },
  };
}

export default function ServiceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
