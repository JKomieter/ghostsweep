// app/dashboard/billing/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CheckoutForm from "../_components/checkout";
import { ShieldCheck, CalendarClock, Zap, Check } from "lucide-react";

type PlanTab = "buster" | "pro" | "sentinel";

type PageProps = {
    searchParams?: Promise<{ plan?: string; canceled?: string }>;
};

const PLANS = {
    buster: {
        label: "Buster Pass",
        price: "$12.99",
        period: "one-time",
        tagline: "Pay once, stay clean. No recurring bill.",
        priceId: process.env.STRIPE_PRICE_BUSTER!,
        mode: "payment" as const,
        badge: null as string | null,
        badgeStyle: "",
        features: [
            "3 scan credits (Work, Personal, Old School)",
            "Full Maigret OSINT deep-web search",
            "Every ghost account & gift card unlocked",
            "PDF Identity Audit + 1Password-ready CSV",
            "One-click account deletion links",
        ],
    },
    pro: {
        label: "Monthly Sub",
        price: "$7.99",
        period: "/ mo",
        tagline: "Unlimited connections and real-time monitoring.",
        priceId: process.env.STRIPE_PRICE_PRO!,
        mode: "subscription" as const,
        badge: null as string | null,
        badgeStyle: "",
        features: [
            "Everything in Buster",
            "Unlimited inbox connections",
            "Real-time breach alerts",
            "Weekly shadow web re-scan",
            'Newsletter "Ghost" unsubscribe',
        ],
    },
    sentinel: {
        label: "Annual Sentinel",
        price: "$59.99",
        period: "/ yr",
        tagline: "The Golden Ticket — just $4.99/mo.",
        priceId: process.env.STRIPE_PRICE_SENTINEL!,
        mode: "subscription" as const,
        badge: "Save 50%+",
        badgeStyle: "bg-emerald-500 text-black",
        features: [
            "Everything in Pro",
            'Priority "Shadow Watch" scan queue',
            "Gift card expiry alerts",
            "Monthly Identity Health Report (PDF)",
            "Priority deletion support",
        ],
    },
};

function formatDate(d: string) {
    try {
        return new Date(d).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return d;
    }
}

export default async function BillingPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("current_plan, renews_at, scan_credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();

    console.log("User visited billing page:", JSON.stringify(sub));

    const currentPlan = sub?.current_plan ?? "free";
    const isPro = currentPlan === "pro";
    const isSentinel = currentPlan === "sentinel";
    const isBuster = currentPlan === "buster";
    const isPaid = isPro || isBuster || isSentinel;
    const renewsAt = sub?.renews_at ?? null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creditsRemaining = (sub as any)?.scan_credits_remaining ?? 0;
    const wasCanceled = params?.canceled === "true";

    // Selected tab from URL (?plan=buster|pro|sentinel), default pro
    const rawTab = params?.plan;
    const selectedTab: PlanTab =
        rawTab === "buster" ? "buster"
        : rawTab === "sentinel" ? "sentinel"
        : "pro";

    const planConfig = PLANS[selectedTab];

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] px-4 py-8">
            <div className="w-full max-w-xl mx-auto rounded-lg border border-white/5 bg-white/2 p-6 md:p-8 shadow-lg space-y-8">
                {/* Header */}
                <header className="space-y-2">
                    <h1 className="text-3xl font-light tracking-tight text-white">
                        GhostSweep Billing
                    </h1>
                    <p className="text-sm text-white/60">
                        Manage your plan and billing details.
                    </p>
                </header>

                {/* Canceled notice */}
                {wasCanceled && !isPaid && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                        <p className="text-sm text-amber-300">
                            Checkout was canceled. You can try again whenever you&apos;re ready.
                        </p>
                    </div>
                )}

                {/* Already on a paid plan */}
                {isPaid ? (
                    <section className="rounded-lg border border-white/5 bg-white/2 p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-500/20 p-2.5 text-emerald-400">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-light text-white">
                                    {isBuster
                                        ? 'You own The "Buster" — one-time purchase'
                                        : isSentinel
                                        ? "You're on GhostSweep Sentinel"
                                        : "You're on GhostSweep Pro"}
                                </p>

                                {isBuster ? (
                                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 w-fit">
                                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                                        <span className="text-xs text-amber-300">
                                            {creditsRemaining} of 3 scan credits remaining
                                        </span>
                                    </div>
                                ) : renewsAt ? (
                                    <p className="mt-2 text-xs text-white/60 flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        Renews on{" "}
                                        <span className="font-light text-white">
                                            {formatDate(renewsAt)}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs text-white/60 flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        No renewal date on file.
                                    </p>
                                )}

                                {/* Buster upsell */}
                                {isBuster && (
                                    <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                                        <p className="text-xs font-medium text-emerald-400">
                                            Want unlimited scans &amp; real-time monitoring?
                                        </p>
                                        <p className="text-xs text-white/50">
                                            Upgrade to Monthly ($7.99/mo) or Annual Sentinel ($59.99/yr) to remove
                                            the 3-credit limit and get continuous protection.
                                        </p>
                                        <div className="flex gap-2 pt-1 flex-wrap">
                                            <Link
                                                href="/dashboard/billing?plan=pro"
                                                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-xs bg-emerald-500 text-black hover:bg-emerald-400 transition font-medium"
                                            >
                                                Monthly — $7.99/mo
                                            </Link>
                                            <Link
                                                href="/dashboard/billing?plan=sentinel"
                                                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-xs border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition"
                                            >
                                                Annual Sentinel — $59.99/yr
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Link
                                        href="/dashboard"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm",
                                            "bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 text-white"
                                        )}
                                    >
                                        Back to dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/support"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm",
                                            "bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 text-emerald-400"
                                        )}
                                    >
                                        Billing help
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <>
                        {/* Plan tabs */}
                        <div className="flex rounded-lg border border-white/5 bg-white/2 p-1 text-xs gap-1">
                            {(["buster", "pro", "sentinel"] as PlanTab[]).map((tab) => {
                                const isActive = selectedTab === tab;
                                const label =
                                    tab === "buster" ? "Buster · $12.99" :
                                    tab === "pro" ? "Monthly · $7.99/mo" :
                                    "Annual · $59.99/yr";
                                return (
                                    <Link
                                        key={tab}
                                        href={`/dashboard/billing?plan=${tab}`}
                                        className={cn(
                                            "flex-1 text-center px-2 py-1.5 rounded-md transition-colors whitespace-nowrap",
                                            isActive
                                                ? tab === "buster"
                                                    ? "bg-amber-500/20 text-amber-300 font-medium"
                                                    : tab === "sentinel"
                                                    ? "bg-emerald-500/20 text-emerald-300 font-medium"
                                                    : "bg-white text-black font-medium"
                                                : "text-white/50 hover:text-white/80"
                                        )}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Plan summary card */}
                        <section
                            className={cn(
                                "rounded-lg border p-6 space-y-4",
                                selectedTab === "buster"
                                    ? "border-amber-500/25 bg-amber-500/5"
                                    : selectedTab === "sentinel"
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : "border-white/5 bg-white/2"
                            )}
                        >
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        selectedTab === "buster" ? "text-amber-300"
                                        : selectedTab === "sentinel" ? "text-emerald-400"
                                        : "text-white"
                                    )}>
                                        {planConfig.label}
                                    </p>
                                    {selectedTab === "buster" && (
                                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-black">
                                            One-Time
                                        </span>
                                    )}
                                    {planConfig.badge && (
                                        <span className={cn(
                                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                            planConfig.badgeStyle
                                        )}>
                                            {planConfig.badge}
                                        </span>
                                    )}
                                </div>
                                <p className={cn(
                                    "mt-1 text-3xl font-light",
                                    selectedTab === "buster" ? "text-amber-400"
                                    : selectedTab === "sentinel" ? "text-emerald-400"
                                    : "text-white"
                                )}>
                                    {planConfig.price}
                                    <span className="text-base text-white/40 ml-1">
                                        {planConfig.period}
                                    </span>
                                </p>
                                <p className="mt-1 text-xs text-white/50">{planConfig.tagline}</p>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-2">
                                <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                                    What you get
                                </p>
                                <ul className="space-y-2">
                                    {planConfig.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                                            <Check className={cn(
                                                "h-3.5 w-3.5 shrink-0 mt-0.5",
                                                selectedTab === "buster" ? "text-amber-400" : "text-emerald-400"
                                            )} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Checkout */}
                        <section className="space-y-3">
                            <p className="text-sm text-white/60">
                                You&apos;re upgrading to{" "}
                                <span className="font-medium text-white">
                                    {planConfig.label}
                                    {" — "}
                                    {planConfig.price}
                                    {planConfig.period !== "one-time" ? " " + planConfig.period : " (one-time)"}
                                </span>
                                .
                            </p>
                            <CheckoutForm
                                priceId={planConfig.priceId}
                                mode={planConfig.mode}
                            />
                        </section>

                        <footer className="text-[11px] text-white/35">
                            Payments processed securely by Stripe. GhostSweep never stores your card
                            details.{selectedTab !== "buster" && " Cancel anytime."}
                        </footer>
                    </>
                )}
            </div>
        </main>
    );
}
