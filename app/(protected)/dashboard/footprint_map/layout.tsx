import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Footprint Map | GhostSweep Dashboard",
  description: "Interactive map of your digital footprint. Visualize and manage all locations where your data appears online.",
  keywords: [
    "footprint map",
    "digital map",
    "data locations",
    "account locations",
    "online map",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Footprint Map | GhostSweep",
    description: "Map your digital presence across platforms.",
    url: "https://ghostsweep.com/dashboard/footprint_map",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/footprint_map",
  },
};

export default function FootprintMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
