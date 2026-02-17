// app/home/unsubscribe/page.tsx
import { Ghost } from "lucide-react";
import UnsubscribeClient from "../_components/unsubscribe-client";

type PageProps = {
    searchParams?: Promise<{ email?: string; list?: string }>;
};

export default async function UnsubscribePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const email = params?.email || "";
    const list = params?.list || "product-updates";

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] px-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-white/3 p-8 shadow-2xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Ghost className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-white">
                                Manage emails
                            </h1>
                            <p className="text-xs text-white/30">GhostSweep</p>
                        </div>
                    </div>

                    <p className="text-sm text-white/45 leading-relaxed mb-6">
                        Unsubscribe from GhostSweep updates and non-essential
                        emails. We may still send important account or security
                        notifications.
                    </p>

                    <UnsubscribeClient initialEmail={email} initialList={list} />

                    <p className="mt-6 text-[11px] text-white/20 leading-relaxed">
                        If this wasn&apos;t you, you can safely ignore this page. Your
                        account remains secure.
                    </p>
                </div>
            </div>
        </main>
    );
}
