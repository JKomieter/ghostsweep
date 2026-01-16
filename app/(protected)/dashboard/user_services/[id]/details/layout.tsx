import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

// Dynamic metadata generation based on service name
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // Fetch service details to get the service name
  let serviceName = "Service";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://ghostsweep.com"}/api/user_services/${id}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      serviceName = data.service?.name || data.name || "Service";
    }
  } catch (error) {
    console.error("Failed to fetch service name:", error);
  }

  return {
    title: `${serviceName} Details | GhostSweep`,
    description: `View detailed information about your ${serviceName} account. Check security status, activity history, and manage deletion options.`,
    keywords: [
      "service details",
      serviceName.toLowerCase(),
      "account details",
      "service management",
      "account security",
    ],
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `${serviceName} Details | GhostSweep`,
      description: `Manage your ${serviceName} account security and details.`,
      url: `https://ghostsweep.com/dashboard/user_services/${id}/details`,
      type: "website",
    },
    alternates: {
      canonical: `https://ghostsweep.com/dashboard/user_services/${id}/details`,
    },
  };
}

export default function ServiceDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
