import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | GhostSweep - Discover Your Hidden Accounts",
  description: "Sign in to GhostSweep to discover forgotten accounts, detect data breaches, and take control of your digital footprint. Secure, privacy-first authentication.",
  keywords: [
    "sign in",
    "login",
    "account access",
    "ghostsweep login",
    "privacy-first authentication",
    "secure login",
  ],
  openGraph: {
    title: "Sign In | GhostSweep",
    description: "Access your GhostSweep account to discover and manage your digital presence.",
    url: "https://ghostsweep.com/login",
    type: "website",
  },
  alternates: {
    canonical: "https://ghostsweep.com/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
