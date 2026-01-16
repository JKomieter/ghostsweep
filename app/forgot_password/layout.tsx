import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Reset Your GhostSweep Account",
  description: "Securely reset your GhostSweep account password. Instructions to regain access to your account.",
  keywords: [
    "forgot password",
    "reset password",
    "account recovery",
    "password reset",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
