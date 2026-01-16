import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Shadow Map | GhostSweep",
  description: "Visualize your digital footprint. See where your data exists across the web and understand your online presence at a glance.",
  keywords: [
    "digital shadow",
    "digital footprint map",
    "online presence",
    "data locations",
    "digital safety",
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Digital Shadow Map | GhostSweep",
    description: "Visualize your complete digital footprint across all platforms.",
    url: "https://ghostsweep.com/dashboard/digital_shadow",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/dashboard/digital_shadow",
  },
};

export default function DigitalShadowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
