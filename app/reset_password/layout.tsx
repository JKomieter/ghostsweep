import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | GhostSweep Account",
  description: "Create a new password for your GhostSweep account. Secure account recovery process.",
  keywords: [
    "reset password",
    "create new password",
    "account recovery",
    "password change",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
