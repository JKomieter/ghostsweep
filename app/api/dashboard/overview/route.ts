import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { RECOVERABLE_VALUE_TYPES, claimableCents } from "@/lib/found-values";
import { isAccountRow } from "@/lib/account-risk";
import { getUserPlan } from "@/lib/entitlements";

// TODO: Replace with your actual Supabase URL and anon key
export async function GET() {
  const supabase = await createClient();
  
      // 1) Auth
      const {
          data: { user },
          error: userError,
      } = await supabase.auth.getUser();
  
      if (userError || !user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

  // Total value found: money the user can claim (not subscriptions, which are money going out)
  const { data: valueRows } = await supabase
    .from("found_values")
    .select("amount, status, risk_level")
    .eq("user_id", user.id)
    .in("type", [...RECOVERABLE_VALUE_TYPES])
    .eq("status", "active");
  // Convert from cents to dollars
  const totalValue = claimableCents(valueRows || []) / 100;

  // Helper: convert an amount (in cents) to its monthly equivalent based on frequency
  const getMonthlyAmount = (amount: string | number, freq: string) => {
    const num = Number(amount) || 0; // amount is in cents
    switch (freq) {
      case "daily": return num * 30;
      case "weekly": return num * 4.33;
      case "biweekly": return num * 2.17;
      case "monthly": return num;
      case "quarterly": return num / 3;
      case "annual": return num / 12;
      default: return num;
    }
  };

  // Active subscriptions
  const { data: subRows } = await supabase
    .from("found_values")
    .select("id, amount, billing_frequency, service_name")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "active");
  // Deduplicate subscriptions by normalized service_name (fallback to id), convert to monthly cents and then to dollars
  const seenSubs = new Set<string>();
  let uniqueMonthlyCents = 0;
  for (const row of (subRows || [])) {
    const keyRaw = (row.service_name || "").toString();
    const key = keyRaw.trim().length ? keyRaw.toLowerCase().trim() : row.id;
    if (seenSubs.has(key)) continue;
    seenSubs.add(key);
    uniqueMonthlyCents += getMonthlyAmount(row.amount, row.billing_frequency || "monthly");
  }
  const totalSubs = uniqueMonthlyCents / 100;
  const uniqueSubsCount = seenSubs.size;

  // Newsletters count (include both spam and newsletter category services)
  const [{ data: allUserServices }, { data: deletions }] = await Promise.all([
    supabase
      .from("user_services")
      .select(`
        id,
        is_spam,
        status,
        services!inner (
          category
        )
      `)
      .eq("user_id", user.id),
    supabase.from("deletion_requests").select("user_service_id").eq("user_id", user.id),
  ]);

  // Filter for newsletters and spam services (same logic as newsletters API)
  const filteredServices = (allUserServices || []).filter(us => {
    const service = Array.isArray(us.services) ? us.services[0] : us.services;
    return us.is_spam === true || service?.category === "Newsletter";
  });

  // Apply same status filter as newsletters API - only active services
  const activeNewsletters = filteredServices.filter(us => 
    us.status === null || us.status === "active"
  );
  
  const newsletters = activeNewsletters.length;

  // Accounts: same definition as the Accounts page and Risk Snapshot (not newsletters/spam, not deleted)
  const deleted = new Set((deletions || []).map(d => d.user_service_id));
  const oldAccounts = (allUserServices || []).filter(us => isAccountRow(us, us.services) && !deleted.has(us.id)).length;

  // Recent finds: real money only (no subscriptions, $0 items or likely scams). Only display fields
  // are selected so codes/PINs/links never reach the client; free users don't see the merchant
  // either, matching the locked cards on the value page.
  const { hasPaidAccess } = await getUserPlan(supabase, user.id);
  const { data: recentRows } = await supabase
    .from("found_values")
    .select("id, type, amount, service_name, detected_at, risk_level")
    .eq("user_id", user.id)
    .in("type", [...RECOVERABLE_VALUE_TYPES])
    .gt("amount", 0)
    .order("detected_at", { ascending: false })
    .limit(10);
  const recent = (recentRows || [])
    .filter(r => r.risk_level !== "high_risk")
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      type: r.type,
      amount: Number(r.amount) || 0, // cents
      service_name: hasPaidAccess ? r.service_name : null,
      detected_at: r.detected_at,
    }));

  return NextResponse.json({
    totalValue,
    totalSubs,
    uniqueSubsCount,
    newsletters,
    oldAccounts,
    recent,
  });
}
