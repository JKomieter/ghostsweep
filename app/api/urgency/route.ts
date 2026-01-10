import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
    inactive4y: number;
    unknownOrLowSignal: number;
    oldestYear: number | null;
  };
  topRiskTeasers: UrgencyTeaser[];
  monitoringEndsAt: string | null;
};

const FREE_LIMIT_DEFAULT = 10;

function yearsAgoDate(years: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

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

  // 2) Subscription / gating
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("current_plan,is_trial,trial_ends_at")
    .eq("user_id", userId)
    .maybeSingle();

  const currentPlan = sub?.current_plan ?? "free";
  const isPro = currentPlan !== "free";
  const freeLimit = FREE_LIMIT_DEFAULT;
  const gated = !isPro;

  const monitoringEndsAt =
    sub?.is_trial && sub?.trial_ends_at ? sub.trial_ends_at : null;

  // 3) Get all user_services
  const { data: userServices, error: usErr } = await supabase
    .from("user_services")
    .select(
      "id, email_count, last_seen_at, first_seen_at, service:services(id,name,domain)"
    )
    .eq("user_id", userId);

  if (usErr) {
    return NextResponse.json(
      { error: "Failed to load user services" },
      { status: 500 }
    );
  }

  const rows = userServices ?? [];
  const totalServices = rows.length;

  const oneYearAgo = yearsAgoDate(1).getTime();
  const fourYearsAgo = yearsAgoDate(4).getTime();

  let stillEmailing = 0;
  let inactive1y = 0;
  let inactive4y = 0;
  let unknownOrLowSignal = 0;
  let oldestYear: number | null = null;

  for (const r of rows) {
    const lastSeen = r.last_seen_at ? new Date(r.last_seen_at).getTime() : null;

    const emails = typeof r.email_count === "number" ? r.email_count : 0;
    if (emails > 0) stillEmailing += 1;

    if (!lastSeen) {
      unknownOrLowSignal += 1;
    } else {
      if (lastSeen < oneYearAgo) inactive1y += 1;
      if (lastSeen < fourYearsAgo) inactive4y += 1;
    }

    const y =
      safeYear(r.first_seen_at ?? r.last_seen_at ?? null) ??
      safeYear(r.last_seen_at ?? null);

    if (typeof y === "number") {
      if (oldestYear === null) oldestYear = y;
      else oldestYear = Math.min(oldestYear, y);
    }
  }

  // 4) FIXED: Get breached services properly
  // First get all user_breaches with their breach_id
  const { data: userBreaches, error: ubErr } = await supabase
    .from("user_breaches")
    .select("breach_id")
    .eq("user_id", userId);

  if (ubErr) {
    console.error("Error loading user breaches:", ubErr);
    return NextResponse.json(
      { error: "Failed to load breaches" },
      { status: 500 }
    );
  }

  // Then get the actual breaches with service_id
  const breachIds = (userBreaches ?? []).map(ub => ub.breach_id).filter(Boolean);

  const breachedServiceIds = new Set<string>();

  if (breachIds.length > 0) {
    const { data: breaches, error: breachErr } = await supabase
      .from("breaches")
      .select("service_id")
      .in("id", breachIds);

    if (breachErr) {
      console.error("Error loading breaches details:", breachErr);
    } else {
      for (const breach of breaches ?? []) {
        if (breach.service_id) {
          breachedServiceIds.add(breach.service_id);
        }
      }
    }
  }

  const breached = breachedServiceIds.size;

  // 5) Build "top risk" teasers
  const scored = rows
    .map((r) => {
      const service = Array.isArray(r.service) ? r.service[0] : r.service;
      const serviceId = service?.id ?? null;
      const isBreached = serviceId ? breachedServiceIds.has(serviceId) : false;

      const lastSeenMs = r.last_seen_at ? new Date(r.last_seen_at).getTime() : null;
      const emails = typeof r.email_count === "number" ? r.email_count : 0;

      // simple scoring: breached >> very old >> emails
      const score =
        (isBreached ? 10_000 : 0) +
        (lastSeenMs ? (lastSeenMs < fourYearsAgo ? 3_000 : lastSeenMs < oneYearAgo ? 1_000 : 0) : 250) +
        Math.min(999, emails);

      return {
        score,
        teaser: {
          id: r.id as string,
          name: service?.name ?? "Unknown",
          domain: service?.domain ?? null,
          breached: isBreached,
          emailCount: emails,
          lastSeenAt: r.last_seen_at ?? null,
        } satisfies UrgencyTeaser,
      };
    })
    .sort((a, b) => b.score - a.score);

  const topRiskTeasersAll = scored.slice(0, 6).map((x) => x.teaser);
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
      inactive4y,
      unknownOrLowSignal,
      oldestYear,
    },
    topRiskTeasers,
    monitoringEndsAt,
  };

  return NextResponse.json(payload);
}