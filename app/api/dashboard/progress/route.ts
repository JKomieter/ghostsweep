import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { RECOVERABLE_VALUE_TYPES } from "@/lib/found-values";
import { isAccountRow, isBreached, isUnused, unusedCutoff } from "@/lib/account-risk";

// Cleanup progress for the dashboard: what the user has finished, what's left, and this month's wins.
// Uses the same account/risk rules as the Accounts page so the numbers line up.

export type ChecklistItem = {
  key: "connect" | "sweep" | "breached" | "unused" | "value" | "newsletters";
  label: string;
  done: number;
  total: number;
  href: string;
};

export type ProgressResponse = {
  privacyScore: number | null;
  month: {
    accountsClosed: number;
    newslettersUnsubscribed: number;
    valueClaimed: number; // dollars
    riskReducedPercent: number; // share of this month's risky accounts the user has closed
  };
  checklist: ChecklistItem[];
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [services, breaches, deletions, values, gmail, outlook, sweeps, score] = await Promise.all([
    supabase
      .from("user_services")
      .select("id, service_id, is_spam, status, last_seen_at, updated_at, services!inner(category)")
      .eq("user_id", user.id),
    supabase.from("user_breaches").select("service_id").eq("user_id", user.id),
    supabase.from("deletion_requests").select("user_service_id, created_at").eq("user_id", user.id),
    supabase
      .from("found_values")
      .select("amount, status, risk_level, recovered_at")
      .eq("user_id", user.id)
      .in("type", [...RECOVERABLE_VALUE_TYPES]),
    supabase.from("gmail_accounts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("microsoft_accounts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("sweep_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
    supabase.from("user_security_scores").select("score").eq("user_id", user.id).maybeSingle(),
  ]);

  if (services.error) {
    console.error("progress: failed to load services", services.error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }

  const rows = services.data ?? [];
  const breachedIds = new Set((breaches.data ?? []).map((b) => b.service_id).filter((id): id is string => Boolean(id)));
  const deletionByService = new Map((deletions.data ?? []).map((d) => [d.user_service_id, d.created_at as string]));
  const cutoff = unusedCutoff(now);

  // Accounts: closed = has a deletion request
  const accounts = rows.filter((r) => isAccountRow(r, r.services));
  const breachedAccounts = accounts.filter((r) => isBreached(r, breachedIds));
  const unusedAccounts = accounts.filter((r) => !isBreached(r, breachedIds) && isUnused(r, cutoff));
  const closed = (r: { id: string }) => deletionByService.has(r.id);
  const closedThisMonth = (r: { id: string }) => (deletionByService.get(r.id) ?? "") >= monthStart;

  const risky = [...breachedAccounts, ...unusedAccounts];
  const riskyClosedThisMonth = risky.filter(closedThisMonth).length;
  const riskyOpenAtMonthStart = risky.filter((r) => !closed(r) || closedThisMonth(r)).length;

  // Newsletters
  const newsletters = rows.filter((r) => !isAccountRow(r, r.services));
  const unsubscribed = newsletters.filter((r) => r.status === "unsubscribed");

  // Money: claimable now vs already claimed
  const valueRows = (values.data ?? []).filter((v) => v.risk_level !== "high_risk");
  const claimedRows = valueRows.filter((v) => v.status === "recovered");
  const claimableRows = valueRows.filter((v) => v.status === "active");

  const inboxes = (gmail.count ?? 0) + (outlook.count ?? 0);

  const checklist: ChecklistItem[] = [
    { key: "connect", label: "Connect your inbox", done: inboxes > 0 ? 1 : 0, total: 1, href: "/dashboard/settings" },
    { key: "sweep", label: "Run your first sweep", done: (sweeps.count ?? 0) > 0 ? 1 : 0, total: 1, href: "/dashboard" },
    { key: "breached", label: "Close breached accounts", done: breachedAccounts.filter(closed).length, total: breachedAccounts.length, href: "/dashboard/accounts?status=breached" },
    { key: "unused", label: "Close accounts unused for a year", done: unusedAccounts.filter(closed).length, total: unusedAccounts.length, href: "/dashboard/accounts?status=unused" },
    { key: "value", label: "Claim gift cards and rewards", done: claimedRows.length, total: claimedRows.length + claimableRows.length, href: "/dashboard/value-recovery" },
    { key: "newsletters", label: "Unsubscribe from newsletters", done: unsubscribed.length, total: newsletters.length, href: "/dashboard/newsletters" },
  ];

  const payload: ProgressResponse = {
    privacyScore: typeof score.data?.score === "number" ? score.data.score : null,
    month: {
      accountsClosed: accounts.filter(closedThisMonth).length,
      newslettersUnsubscribed: unsubscribed.filter((r) => (r.updated_at ?? "") >= monthStart).length,
      valueClaimed: claimedRows
        .filter((v) => (v.recovered_at ?? "") >= monthStart)
        .reduce((sum, v) => sum + (Number(v.amount) || 0), 0) / 100, // cents → dollars
      riskReducedPercent: riskyOpenAtMonthStart ? Math.round((riskyClosedThisMonth / riskyOpenAtMonthStart) * 100) : 0,
    },
    checklist,
  };

  return NextResponse.json(payload);
}
