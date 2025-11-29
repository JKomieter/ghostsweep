// app/unsubscribe/page.tsx

import UnsubscribeClient from "../_components/unsubscribe-client";

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams?: { email?: string; list?: string };
}) {
  const email = searchParams?.email || "";
  const list = searchParams?.list || "product-updates";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#02040a] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050505] p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Manage your GhostSweep emails
        </h1>
        <p className="mt-2 text-sm text-white/60">
          You can unsubscribe from GhostSweep waitlist updates and other
          non-essential emails here. We may still send you important
          account or security notifications.
        </p>

        <div className="mt-6">
          <UnsubscribeClient initialEmail={email} initialList={list} />
        </div>

        <p className="mt-4 text-[11px] text-white/40">
          If this wasn’t you, you can safely ignore this page. Your account
          remains secure.
        </p>
      </div>
    </main>
  );
}