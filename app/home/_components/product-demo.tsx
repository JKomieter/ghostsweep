"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Check,
    DollarSign,
    ExternalLink,
    Fingerprint,
    Gift,
    LayoutDashboard,
    Lock,
    Mail,
    MailX,
    Map as MapIcon,
    MousePointerClick,
    RotateCcw,
    ScanSearch,
    Shield,
    Trash2,
    X,
    Zap,
} from "lucide-react";
import { CHECKOUT_REASSURANCE, FREE_ACCOUNT_PREVIEW, PAID_PLANS, type PaidPlanId } from "@/lib/plans";

// An interactive, sample-data replica of the real dashboard (Overview, Accounts, Value Recovery,
// Newsletters, Identity Shadow). Locked actions open the same upgrade pitch the app shows, with
// plan links that carry through signup straight to checkout (see lib/pending-plan.ts).

const SIGNUP_HREF = "/login?mode=signup";
const PLAN_SIGNUP_HREF: Record<PaidPlanId, string> = {
    buster: "/login?mode=signup&plan=buster",
    pro: "/login?mode=signup&plan=monthly",
    sentinel: "/login?mode=signup&plan=annual",
};

// ─── Sample data ───────────────────────────────────────────────
const TOTALS = {
    accounts: 134,
    breached: 12,
    shadow: 37,
    value: 285,
    newsletters: 18,
    subsMonthly: 47.96,
    privacyScore: 42,
};

type Risk = "high" | "medium" | "low";

const ACCOUNTS: { name: string; domain: string; lastSeen: string; breached: boolean; risk: Risk; color: string }[] = [
    { name: "MyFitnessPal", domain: "myfitnesspal.com", lastSeen: "6 yrs ago", breached: true, risk: "high", color: "bg-sky-500" },
    { name: "Adobe", domain: "adobe.com", lastSeen: "4 yrs ago", breached: true, risk: "high", color: "bg-red-500" },
    { name: "Dropbox", domain: "dropbox.com", lastSeen: "3 yrs ago", breached: true, risk: "high", color: "bg-blue-600" },
    { name: "Canva", domain: "canva.com", lastSeen: "2 yrs ago", breached: true, risk: "medium", color: "bg-cyan-500" },
    { name: "Evite", domain: "evite.com", lastSeen: "7 yrs ago", breached: true, risk: "medium", color: "bg-purple-500" },
    { name: "Groupon", domain: "groupon.com", lastSeen: "5 yrs ago", breached: false, risk: "medium", color: "bg-green-600" },
    { name: "Quizlet", domain: "quizlet.com", lastSeen: "8 yrs ago", breached: false, risk: "low", color: "bg-indigo-500" },
    { name: "Spotify", domain: "spotify.com", lastSeen: "Active", breached: false, risk: "low", color: "bg-emerald-600" },
];

const VALUES: { service: string; type: string; amount: number; expires: string | null; urgent?: boolean }[] = [
    { service: "Amazon", type: "Gift card", amount: 100, expires: null },
    { service: "Target", type: "Gift card", amount: 50, expires: null },
    { service: "Sephora", type: "Rewards", amount: 40, expires: "in 3 weeks" },
    { service: "Nike", type: "Coupon", amount: 35, expires: "in 5 days", urgent: true },
    { service: "Starbucks", type: "Gift card", amount: 25, expires: "in 9 days", urgent: true },
    { service: "Best Buy", type: "Rewards", amount: 20, expires: null },
    { service: "Uber Eats", type: "Credit", amount: 15, expires: "in 2 months" },
];

const NEWSLETTERS: { sender: string; perMonth: number; opened: string }[] = [
    { sender: "Old Navy", perMonth: 31, opened: "0%" },
    { sender: "Groupon Deals", perMonth: 28, opened: "0%" },
    { sender: "LinkedIn Digest", perMonth: 22, opened: "2%" },
    { sender: "Wayfair", perMonth: 19, opened: "1%" },
    { sender: "Medium Daily", perMonth: 30, opened: "4%" },
];

const SHADOWS: { site: string; matchedBy: string; risk: Risk; note: string }[] = [
    { site: "Pinterest", matchedBy: "username", risk: "medium", note: "Public profile with photo" },
    { site: "Gravatar", matchedBy: "email", risk: "high", note: "Exposes full name + avatar" },
    { site: "Duolingo", matchedBy: "email", risk: "high", note: "Appeared in 2023 data scrape" },
    { site: "Strava", matchedBy: "username", risk: "medium", note: "Activity map is public" },
    { site: "Venmo", matchedBy: "phone", risk: "low", note: "Transactions set to friends" },
];

const SCAN_LOG = [
    "Connecting to inbox (read-only)…",
    "Reading sender headers since 2009…",
    "Found accounts on adobe.com, dropbox.com, canva.com…",
    "Cross-checking 134 services against breach databases…",
    "Searching 400+ sites for shadow profiles…",
    "Detecting gift cards, coupons & rewards…",
];

// ─── Tabs (mirror the real app sidebar) ────────────────────────
type TabId = "overview" | "accounts" | "value" | "newsletters" | "shadow";

const TABS: { id: TabId; label: string; short: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", short: "Overview", icon: LayoutDashboard },
    { id: "accounts", label: "Accounts", short: "Accounts", icon: MapIcon },
    { id: "value", label: "Value Recovery", short: "Value", icon: Zap },
    { id: "newsletters", label: "Newsletters", short: "Mail", icon: Shield },
    { id: "shadow", label: "Identity Shadow", short: "Shadow", icon: Fingerprint },
];

// What each locked action unlocks, shown in the upgrade sheet
type PaywallReason = "accounts" | "delete" | "value" | "newsletters" | "shadow";

const PAYWALL_COPY: Record<PaywallReason, { title: string; body: string }> = {
    accounts: {
        title: `See all ${TOTALS.accounts} accounts`,
        body: `The free scan previews ${FREE_ACCOUNT_PREVIEW}. Unlock the full list, with breach status and last activity for every one.`,
    },
    delete: {
        title: "See how to delete every account",
        body: "Get the direct deletion link and privacy contact for each service, with step-by-step guides so you can close it yourself.",
    },
    value: {
        title: `Claim the $${TOTALS.value} in your inbox`,
        body: "Reveal every gift card number, PIN and coupon code, with redemption links and expiry alerts so nothing lapses.",
    },
    newsletters: {
        title: `Unsubscribe from all ${TOTALS.newsletters} at once`,
        body: "One click clears every mailing list you never read. Pro keeps watching and catches new ones as they appear.",
    },
    shadow: {
        title: `Clean up ${TOTALS.shadow} shadow profiles`,
        body: "Get removal links and step-by-step guides for each profile, plus a weekly re-scan for new ones.",
    },
};

const AUTOPLAY_ORDER: TabId[] = ["overview", "accounts", "value", "newsletters", "shadow"];
const AUTOPLAY_MS = 5500;

const RISK_STYLE: Record<Risk, string> = {
    high: "text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/25",
    medium: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
    low: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
    return useSyncExternalStore(
        subscribeReducedMotion,
        () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
        () => false
    );
}

// ─── Small pieces ──────────────────────────────────────────────
function RiskBadge({ risk }: { risk: Risk }) {
    return (
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${RISK_STYLE[risk]}`}>
            {risk}
        </span>
    );
}

function ServiceMark({ name, color }: { name: string; color: string }) {
    return (
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white ${color}`}>
            {name[0]}
        </span>
    );
}

function LockedButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-black shadow-sm transition hover:bg-emerald-400 active:scale-[0.98]"
        >
            <Lock className="h-3.5 w-3.5" />
            {children}
        </button>
    );
}

function DemoStat({
    label,
    value,
    tone,
    onClick,
}: {
    label: string;
    value: string;
    tone: "success" | "warning" | "danger" | "default";
    onClick?: () => void;
}) {
    const dot = { success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-red-500", default: "bg-foreground/40" }[tone];
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-full flex-col justify-between gap-3 rounded-lg border border-foreground/5 bg-foreground/2 p-4 text-left transition hover:border-foreground/15 hover:bg-foreground/4"
        >
            <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/45">{label}</span>
            <span className="flex items-end justify-between">
                <span className="text-2xl sm:text-3xl font-light tracking-tight text-foreground tabular-nums">{value}</span>
                <span className={`h-1 w-1 rounded-full ${dot}`} />
            </span>
        </button>
    );
}

// ─── Screens ───────────────────────────────────────────────────
function OverviewScreen({ go }: { go: (t: TabId) => void }) {
    const priorities = [
        {
            icon: AlertTriangle,
            tone: "text-red-600 dark:text-red-400",
            text: `${TOTALS.breached} breached accounts are still open`,
            tab: "accounts" as TabId,
        },
        {
            icon: Gift,
            tone: "text-amber-700 dark:text-amber-400",
            text: "$25 Starbucks gift card expires in 9 days",
            tab: "value" as TabId,
        },
        {
            icon: Fingerprint,
            tone: "text-purple-600 dark:text-purple-400",
            text: "Gravatar is exposing your full name",
            tab: "shadow" as TabId,
        },
        {
            icon: MailX,
            tone: "text-blue-600 dark:text-blue-400",
            text: `${TOTALS.newsletters} newsletters you never open`,
            tab: "newsletters" as TabId,
        },
    ];

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Welcome back</h3>
                <p className="text-xs text-foreground/55">Last sweep: just now · j•••@gmail.com</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <DemoStat label="Total value found" value={`$${TOTALS.value}`} tone="success" onClick={() => go("value")} />
                <DemoStat label="Subscriptions" value={`$${TOTALS.subsMonthly}`} tone="warning" />
                <DemoStat label="Accounts" value={String(TOTALS.accounts)} tone="default" onClick={() => go("accounts")} />
                <DemoStat label="Privacy score" value={`${TOTALS.privacyScore}/100`} tone="danger" />
            </div>
            <div className="rounded-lg border border-foreground/10 bg-card">
                <div className="border-b border-foreground/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/45">
                    Fix these first
                </div>
                <ul className="divide-y divide-foreground/5">
                    {priorities.map((p) => (
                        <li key={p.text}>
                            <button
                                type="button"
                                onClick={() => go(p.tab)}
                                className="group flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground/80 transition hover:bg-foreground/3"
                            >
                                <p.icon className={`h-4 w-4 shrink-0 ${p.tone}`} />
                                <span className="flex-1">{p.text}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-foreground/30 transition group-hover:translate-x-0.5 group-hover:text-foreground/60" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function AccountsScreen({ lock }: { lock: (r: PaywallReason) => void }) {
    const [filter, setFilter] = useState<"all" | "breached">("all");
    const rows = filter === "breached" ? ACCOUNTS.filter((a) => a.breached) : ACCOUNTS;
    const visible = rows.slice(0, 5);
    const blurred = rows.slice(5);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Accounts</h3>
                    <p className="text-xs text-foreground/55">
                        {TOTALS.accounts} services hold your data · {TOTALS.breached} breached
                    </p>
                </div>
                <div className="flex rounded-lg border border-foreground/10 p-0.5 text-xs">
                    {(["all", "breached"] as const).map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`rounded-md px-3 py-1 font-medium capitalize transition ${
                                filter === f
                                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                    : "text-foreground/60 hover:text-foreground"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-foreground/10 bg-card">
                {visible.map((a) => (
                    <div key={a.domain} className="flex items-center gap-3 border-b border-foreground/5 px-3 py-2.5 last:border-0">
                        <ServiceMark name={a.name} color={a.color} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-foreground">{a.name}</span>
                                {a.breached && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-3 w-3" /> Breached
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-foreground/50">Last email {a.lastSeen}</p>
                        </div>
                        <span className="hidden sm:inline-flex">
                            <RiskBadge risk={a.risk} />
                        </span>
                        <button
                            type="button"
                            onClick={() => lock("delete")}
                            aria-label={`Delete ${a.name} account`}
                            className="inline-flex items-center gap-1 rounded-md border border-foreground/10 px-2.5 py-1.5 text-[11px] font-medium text-foreground/70 transition hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <Trash2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                ))}

                {/* Paywalled tail, like the free plan's preview limit */}
                <div className="relative">
                    <div aria-hidden className="pointer-events-none select-none blur-[5px]">
                        {(blurred.length ? blurred : ACCOUNTS.slice(0, 3)).map((a) => (
                            <div key={`b-${a.domain}`} className="flex items-center gap-3 border-t border-foreground/5 px-3 py-2.5">
                                <ServiceMark name={a.name} color={a.color} />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground">{a.name}</div>
                                    <p className="text-[11px] text-foreground/50">Last email {a.lastSeen}</p>
                                </div>
                                <RiskBadge risk={a.risk} />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-b from-card/40 to-card/95 px-4 text-center">
                        <p className="text-xs font-medium text-foreground/80">
                            + {TOTALS.accounts - visible.length} more accounts found
                        </p>
                        <LockedButton onClick={() => lock("accounts")}>Unlock all {TOTALS.accounts}</LockedButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ValueScreen({ lock }: { lock: (r: PaywallReason) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4">
                <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Potential value</div>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-light text-emerald-600 dark:text-emerald-400">${TOTALS.value}</span>
                        <span className="text-sm text-foreground/45">recoverable</span>
                    </div>
                </div>
                <LockedButton onClick={() => lock("value")}>${TOTALS.value} found, unlock to claim</LockedButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {VALUES.slice(0, 6).map((v) => (
                    <button
                        key={v.service}
                        type="button"
                        onClick={() => lock("value")}
                        className="group rounded-lg border border-foreground/10 bg-card p-3.5 text-left transition hover:border-emerald-500/40"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="text-sm font-medium text-foreground">{v.service}</div>
                                <div className="text-[11px] text-foreground/50">{v.type}</div>
                            </div>
                            <div className="text-lg font-light text-emerald-600 dark:text-emerald-400 tabular-nums">${v.amount}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 font-mono text-[11px] text-foreground/60">
                                <span className="select-none blur-sm" aria-label="Hidden until you upgrade">
                                    XKCD-4471-QPLM
                                </span>
                                <Lock className="h-3 w-3 text-foreground/40" />
                            </span>
                            {v.expires && (
                                <span
                                    className={`text-[10px] font-medium ${
                                        v.urgent ? "text-red-600 dark:text-red-400" : "text-foreground/50"
                                    }`}
                                >
                                    Expires {v.expires}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function NewslettersScreen({ lock }: { lock: (r: PaywallReason) => void }) {
    // Single unsubscribes work in the demo, so visitors feel the satisfying part before the upsell
    const [gone, setGone] = useState<string[]>([]);
    const remaining = TOTALS.newsletters - gone.length;
    const emailsSaved = NEWSLETTERS.filter((n) => gone.includes(n.sender)).reduce((s, n) => s + n.perMonth, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Newsletters</h3>
                    <p className="text-xs text-foreground/55">
                        {remaining} lists · {emailsSaved > 0 ? (
                            <span className="text-emerald-700 dark:text-emerald-400">{emailsSaved} fewer emails a month</span>
                        ) : (
                            "130+ emails a month"
                        )}
                    </p>
                </div>
                <LockedButton onClick={() => lock("newsletters")}>Unsubscribe from all {remaining}</LockedButton>
            </div>
            <div className="overflow-hidden rounded-lg border border-foreground/10 bg-card">
                {NEWSLETTERS.map((n) => {
                    const done = gone.includes(n.sender);
                    return (
                        <div
                            key={n.sender}
                            className={`flex items-center gap-3 border-b border-foreground/5 px-3 py-2.5 last:border-0 transition ${
                                done ? "opacity-50" : ""
                            }`}
                        >
                            <Mail className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                            <div className="min-w-0 flex-1">
                                <div className={`truncate text-sm font-medium text-foreground ${done ? "line-through" : ""}`}>
                                    {n.sender}
                                </div>
                                <p className="text-[11px] text-foreground/50">
                                    {n.perMonth} emails/mo · {n.opened} opened
                                </p>
                            </div>
                            {done ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                    <Check className="h-3.5 w-3.5" /> Unsubscribed
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setGone((g) => [...g, n.sender])}
                                    className="rounded-md border border-foreground/10 px-2.5 py-1.5 text-[11px] font-medium text-foreground/70 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Unsubscribe
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ShadowScreen({ lock }: { lock: (r: PaywallReason) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Identity Shadow</h3>
                    <p className="text-xs text-foreground/55">
                        {TOTALS.shadow} profiles you didn&apos;t know were linked to you
                    </p>
                </div>
                <LockedButton onClick={() => lock("shadow")}>Remove all {TOTALS.shadow}</LockedButton>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SHADOWS.slice(0, 4).map((s) => (
                    <div key={s.site} className="rounded-lg border border-foreground/10 bg-card p-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-foreground">{s.site}</span>
                            </div>
                            <RiskBadge risk={s.risk} />
                        </div>
                        <p className="mt-2 text-xs text-foreground/65">{s.note}</p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-foreground/45">Matched by {s.matchedBy}</span>
                            <button
                                type="button"
                                onClick={() => lock("shadow")}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 hover:underline dark:text-purple-400"
                            >
                                Remove <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Scan intro ────────────────────────────────────────────────
function ScanScreen({ progress, line }: { progress: number; line: number }) {
    return (
        <div className="flex min-h-[340px] flex-col items-center justify-center px-2 py-8 text-center">
            <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <ScanSearch className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-foreground">Sweeping j•••@gmail.com</p>
            <div className="mt-4 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-foreground/10">
                <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <ul className="mt-5 w-full max-w-sm space-y-1.5 text-left font-mono text-[11px] text-foreground/60">
                {SCAN_LOG.slice(0, line + 1).map((l, i) => (
                    <li key={l} className="flex items-start gap-2">
                        {i < line ? (
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <span className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                        )}
                        <span className={i < line ? "" : "text-foreground"}>{l}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─── Upgrade sheet (mirrors the in-app paywall) ────────────────
function UpgradeSheet({ reason, onClose }: { reason: PaywallReason; onClose: () => void }) {
    const copy = PAYWALL_COPY[reason];
    const plans: { id: PaidPlanId; featured?: boolean }[] = [
        { id: "buster" },
        { id: "pro" },
        { id: "sentinel", featured: true },
    ];

    return (
        <div
            className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-background/70 p-3 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-upgrade-title"
        >
            <div
                className="relative w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-card p-5 sm:p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Back to demo"
                    className="absolute right-3 top-3 rounded-full p-1.5 text-foreground/45 transition hover:bg-foreground/10 hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
                <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    <Zap className="h-3.5 w-3.5" /> Paid feature
                </div>
                <h4 id="demo-upgrade-title" className="pr-6 text-xl font-semibold text-foreground">
                    {copy.title}
                </h4>
                <p className="mt-1.5 text-sm text-foreground/65 leading-relaxed">{copy.body}</p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {plans.map(({ id, featured }) => {
                        const plan = PAID_PLANS[id];
                        return (
                            <Link
                                key={id}
                                href={PLAN_SIGNUP_HREF[id]}
                                className={`group relative flex sm:flex-col items-center sm:items-start justify-between gap-1 rounded-xl border p-3 transition ${
                                    featured
                                        ? "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15"
                                        : "border-foreground/10 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                                }`}
                            >
                                {featured && (
                                    <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black">
                                        Best value
                                    </span>
                                )}
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
                                    {plan.name}
                                </span>
                                <span className="text-lg font-semibold text-foreground">
                                    {plan.price}
                                    {plan.period !== "one-time" && (
                                        <span className="text-xs font-normal text-foreground/50">{plan.period}</span>
                                    )}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <p className="mt-3 text-center text-[11px] text-foreground/50">{CHECKOUT_REASSURANCE}</p>

                <div className="mt-4 border-t border-foreground/10 pt-4 text-center">
                    <Link
                        href={SIGNUP_HREF}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                        Not sure yet? Run a free scan on your own inbox
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Main ──────────────────────────────────────────────────────
export default function ProductDemo() {
    const reducedMotion = usePrefersReducedMotion();
    const rootRef = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<"idle" | "scanning" | "ready">("idle");
    const [progress, setProgress] = useState(0);
    const [logLine, setLogLine] = useState(0);
    const [tab, setTab] = useState<TabId>("overview");
    const [autoplay, setAutoplay] = useState(true);
    const [paywall, setPaywall] = useState<PaywallReason | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Start the scan animation the first time the demo scrolls into view
    useEffect(() => {
        const el = rootRef.current;
        if (!el || phase !== "idle") return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setPhase(reducedMotion ? "ready" : "scanning");
                    observer.disconnect();
                }
            },
            { threshold: 0.35 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [phase, reducedMotion]);

    // Scan progress → dashboard
    useEffect(() => {
        if (phase !== "scanning") return;
        const total = 4200;
        const start = performance.now();
        let frame = 0;
        const tick = (now: number) => {
            const p = Math.min((now - start) / total, 1);
            setProgress(Math.round(p * 100));
            setLogLine(Math.min(SCAN_LOG.length - 1, Math.floor(p * SCAN_LOG.length)));
            if (p < 1) frame = requestAnimationFrame(tick);
            else setTimeout(() => setPhase("ready"), 350);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [phase]);

    // Guided tour: cycle tabs until the visitor takes over
    useEffect(() => {
        if (phase !== "ready" || !autoplay || paywall || reducedMotion) return;
        const id = setTimeout(() => {
            const next = AUTOPLAY_ORDER[(AUTOPLAY_ORDER.indexOf(tab) + 1) % AUTOPLAY_ORDER.length];
            setTab(next);
        }, AUTOPLAY_MS);
        return () => clearTimeout(id);
    }, [phase, autoplay, tab, paywall, reducedMotion]);

    const takeOver = useCallback(() => {
        setAutoplay(false);
        setHasInteracted(true);
    }, []);

    const go = useCallback(
        (t: TabId) => {
            takeOver();
            setTab(t);
        },
        [takeOver]
    );

    const lock = useCallback(
        (r: PaywallReason) => {
            takeOver();
            setPaywall(r);
        },
        [takeOver]
    );

    const replay = () => {
        setPaywall(null);
        setTab("overview");
        setProgress(0);
        setLogLine(0);
        setAutoplay(true);
        setPhase(reducedMotion ? "ready" : "scanning");
    };

    // Escape closes the upgrade sheet
    useEffect(() => {
        if (!paywall) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPaywall(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [paywall]);

    return (
        <section className="relative pb-20 sm:pb-28 scroll-mt-16" id="demo">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mb-8 text-center">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                        Live product demo
                    </p>
                    <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                        Click around. This is what your scan looks like.
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-foreground/65">
                        A working copy of the GhostSweep dashboard, filled with a typical first scan.
                    </p>
                </div>

                <div
                    ref={rootRef}
                    className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-2xl shadow-foreground/10"
                >
                    {/* Window chrome */}
                    <div className="flex items-center gap-2 border-b border-foreground/10 px-4 py-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                        <div className="ml-3 hidden sm:block flex-1 truncate rounded-md bg-foreground/5 px-3 py-1 font-mono text-[11px] text-foreground/50">
                            ghostsweep.com/dashboard
                        </div>
                        <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            Sample data
                        </span>
                    </div>

                    {phase !== "ready" ? (
                        <ScanScreen progress={progress} line={logLine} />
                    ) : (
                        <div className="flex flex-col md:flex-row">
                            {/* Sidebar (top tabs on mobile) */}
                            <nav
                                aria-label="Demo sections"
                                className="flex md:w-48 md:shrink-0 gap-1 overflow-x-auto border-b border-foreground/10 p-2 md:flex-col md:border-b-0 md:border-r"
                            >
                                {TABS.map((t) => {
                                    const active = tab === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => go(t.id)}
                                            aria-current={active ? "page" : undefined}
                                            className={`relative flex shrink-0 items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                                                active
                                                    ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                                    : "border border-transparent text-foreground/65 hover:bg-foreground/5 hover:text-foreground"
                                            }`}
                                        >
                                            <t.icon className="h-4 w-4 shrink-0" />
                                            <span className="md:hidden">{t.short}</span>
                                            <span className="hidden md:inline">{t.label}</span>
                                            {/* Autoplay timer bar */}
                                            {active && autoplay && !reducedMotion && (
                                                <span
                                                    key={`${t.id}-timer`}
                                                    className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/60"
                                                    style={{ animation: `demo-timer ${AUTOPLAY_MS}ms linear forwards` }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                                <div className="hidden md:block mt-auto pt-3">
                                    <button
                                        type="button"
                                        onClick={replay}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground/50 transition hover:bg-foreground/5 hover:text-foreground"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" /> Replay scan
                                    </button>
                                </div>
                            </nav>

                            {/* Screen */}
                            <div className="min-h-[380px] flex-1 p-4 sm:p-6" onPointerDown={() => autoplay && takeOver()}>
                                {tab === "overview" && <OverviewScreen go={go} />}
                                {tab === "accounts" && <AccountsScreen lock={lock} />}
                                {tab === "value" && <ValueScreen lock={lock} />}
                                {tab === "newsletters" && <NewslettersScreen lock={lock} />}
                                {tab === "shadow" && <ShadowScreen lock={lock} />}
                            </div>
                        </div>
                    )}

                    {phase === "ready" && !hasInteracted && (
                        <div className="pointer-events-none absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background shadow-lg animate-bounce">
                            <MousePointerClick className="h-3.5 w-3.5" /> Try clicking anything
                        </div>
                    )}

                    {paywall && <UpgradeSheet reason={paywall} onClose={() => setPaywall(null)} />}
                </div>

                {/* Conversion strip under the demo */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-4">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                        <DollarSign className="hidden sm:block h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-sm text-foreground/80">
                            <span className="font-semibold text-foreground">Your inbox has its own numbers.</span>{" "}
                            The scan is free and takes about two minutes.
                        </p>
                    </div>
                    <Link
                        href={SIGNUP_HREF}
                        className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
                    >
                        Scan my inbox free
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>

            <style>{`@keyframes demo-timer { from { width: 0% } to { width: 100% } }`}</style>
        </section>
    );
}
