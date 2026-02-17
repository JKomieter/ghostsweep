
import IdentityShadowClient from "./_components/identity-shadow-client";

export const metadata = {
  title: "Identity Shadow | GhostSweep",
  description:
    "Discover ghost accounts, shadow profiles, and data exposures linked to your identity.",
};

export default async function IdentityShadowPage() {

  return <IdentityShadowClient />;
}
