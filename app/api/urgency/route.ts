import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/entitlements";
import { FREE_ACCOUNT_PREVIEW } from "@/lib/plans";
import { compareRisk, isAccountRow, isBreached, isUnused, unusedCutoff } from "@/lib/account-risk";

export const dynamic = "force-dynamic";

type UrgencyTeaser = {
  id: string;
  name: string;
  domain: string | null;
  breached: boolean;
  emailCount: number;
  lastSeenAt: string | null;
};

type UrgencyResponse = {
  currentPlan: string;
  gated: boolean;
  freeLimit: number;
  totals: {
    totalServices: number;
    breached: number;
    stillEmailing: number;
    inactive1y: number;
    unknownOrLowSignal: number;
    oldestYear: number | null;
  };
  topRiskTeasers: UrgencyTeaser[];
  monitoringEndsAt: string | null;
};

function safeYear(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

export async function GET() {
  const supabase = await createClient();

  // 1) Auth
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // 2) Subscription / gating (expired subscriptions count as free)
  const [{ plan, hasPaidAccess }, { data: trial }] = await Promise.all([
    getUserPlan(supabase, userId),
    supabase.from("user_subscriptions").select("is_trial,trial_ends_at").eq("user_id", userId).maybeSingle(),
  ]);

  const currentPlan = plan;
  const freeLimit = FREE_ACCOUNT_PREVIEW;
  const gated = !hasPaidAccess;

  const monitoringEndsAt =
    trial?.is_trial && trial?.trial_ends_at ? trial.trial_ends_at : null;

  // 3) Accounts, breaches and deletions (same universe as the Accounts page)
  const [servicesRes, breachesRes, deletionsRes] = await Promise.all([
    supabase
      .from("user_services")
      .select("id, service_id, email_count, last_seen_at, first_seen_at, is_spam, service:services!inner(id,name,domain,category)")
      .eq("user_id", userId),
    supabase.from("user_breaches").select("service_id").eq("user_id", userId),
    supabase.from("deletion_requests").select("user_service_id").eq("user_id", userId),
  ]);

  if (servicesRes.error) {
    return NextResponse.json(
      { error: "Failed to load user services" },
      { status: 500 }
    );
  }
  if (breachesRes.error) {
    console.error("Error loading user breaches:", breachesRes.error);
    return NextResponse.json(
      { error: "Failed to load breaches" },
      { status: 500 }
    );
  }

  const allRows = servicesRes.data ?? [];
  const deleted = new Set((deletionsRes.data ?? []).map((d) => d.user_service_id));
  const breachedServiceIds = new Set(
    (breachesRes.data ?? []).map((b) => b.service_id).filter((id): id is string => Boolean(id))
  );

  const rows = allRows.filter((r) => isAccountRow(r, r.service) && !deleted.has(r.id));
  const totalServices = rows.length;
  const cutoff = unusedCutoff();

  let breached = 0;
  let stillEmailing = 0;
  let inactive1y = 0;
  let unknownOrLowSignal = 0;
  let oldestYear: number | null = null;

  for (const r of rows) {
    if (isBreached(r, breachedServiceIds)) breached += 1;
    if (!r.last_seen_at) unknownOrLowSignal += 1;
    else if (isUnused(r, cutoff)) inactive1y += 1;
    else stillEmailing += 1;
  }

  // Compute oldestYear across all user services (including spam/newsletters)
  for (const r of allRows) {
    const y = safeYear(r.first_seen_at ?? r.last_seen_at ?? null);
    if (typeof y === "number") {
      if (oldestYear === null) oldestYear = y;
      else oldestYear = Math.min(oldestYear, y);
    }
  }

  // 4) High-risk accounts: only breached or unused ones, breached first, then longest unused.
  // How many emails a service sends says nothing about risk, so it plays no part.
  const topRiskTeasersAll = rows
    .filter((r) => isBreached(r, breachedServiceIds) || isUnused(r, cutoff))
    .sort(compareRisk(breachedServiceIds))
    .slice(0, 6)
    .map((r) => {
      const service = Array.isArray(r.service) ? r.service[0] : r.service;
      return {
        id: r.id as string,
        name: service?.name ?? "Unknown",
        domain: service?.domain ?? null,
        breached: isBreached(r, breachedServiceIds),
        emailCount: typeof r.email_count === "number" ? r.email_count : 0,
        lastSeenAt: r.last_seen_at ?? null,
      } satisfies UrgencyTeaser;
    });
  const topRiskTeasers = gated ? topRiskTeasersAll.slice(0, 4) : topRiskTeasersAll;

  const payload: UrgencyResponse = {
    currentPlan,
    gated,
    freeLimit,
    totals: {
      totalServices,
      breached,
      stillEmailing,
      inactive1y,
      unknownOrLowSignal,
      oldestYear,
    },
    topRiskTeasers,
    monitoringEndsAt,
  };

  return NextResponse.json(payload);
}
