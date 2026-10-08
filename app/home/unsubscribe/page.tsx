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
        <main className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-foreground/10 bg-foreground/3 p-8 shadow-2xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="h-9 w-9 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                            <Ghost className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-foreground">
                                Manage emails
                            </h1>
                            <p className="text-xs text-foreground/55">GhostSweep</p>
                        </div>
                    </div>

                    <p className="text-sm text-foreground/65 leading-relaxed mb-6">
                        Unsubscribe from GhostSweep updates and non-essential
                        emails. We may still send important account or security
                        notifications.
                    </p>

                    <UnsubscribeClient initialEmail={email} initialList={list} />

                    <p className="mt-6 text-[11px] text-foreground/50 leading-relaxed">
                        If this wasn&apos;t you, you can safely ignore this page. Your
                        account remains secure.
                    </p>
                </div>
            </div>
        </main>
    );
}
