
import { createClient } from "@/utils/supabase/server";
import { getUserPlan } from "@/lib/entitlements";
import { newestFirst, pickPreviewIds, upgradeRequired } from "@/lib/free-preview";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Buster, Pro and Annual all get full access
  const { hasPaidAccess } = await getUserPlan(supabase, user.id);
  const plan = hasPaidAccess ? "pro" : "free";

  // Filters
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // active (detected), canceled, kept
  const frequency = searchParams.get("frequency"); // daily, monthly, annual, etc.
  const sort = searchParams.get("sort"); // cost, recent, unused

  // Map status parameter to database status
  const dbStatus = status === "canceled" ? "canceled" : 
                   status === "kept" ? "kept" : 
                   "active"; // active = active

  let query = supabase
    .from("found_values")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "subscription");

  // Apply status filter - if no status param, default to active
  if (!status) {
    query = query.eq("status", "active");
  } else {
    query = query.eq("status", dbStatus);
  }

  // Apply frequency filter
  if (frequency && frequency !== "all") {
    query = query.eq("billing_frequency", frequency);
  }

  // Apply sorting
  if (sort === "cost") {
    query = query.order("amount", { ascending: false });
  } else if (sort === "unused") {
    query = query.order("email_date", { ascending: true, nullsFirst: false });
  } else {
    // Default to recent (most recent detected_at)
    query = query.order("detected_at", { ascending: false });
  }

  const { data: subscriptions } = await query;

  // The same service is often detected in several emails — count each service once, the same way
  // the money totals below are deduplicated, so "N subscriptions" matches the dollar figures
  const serviceKey = (row: { id: string; service_name?: string | null }) => {
    const name = (row.service_name || "").toString().toLowerCase().trim();
    return name || row.id;
  };
  const countUnique = (rows: Array<{ id: string; service_name?: string | null }> | null) =>
    new Set((rows || []).map(serviceKey)).size;

  // Get counts for different statuses
  const { data: canceledRows } = await supabase
    .from("found_values")
    .select("id, service_name")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "canceled");

  const { data: keptRows } = await supabase
    .from("found_values")
    .select("id, service_name")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "kept");

  // Calculate financial metrics
  const getMonthlyAmount = (amount: string, freq: string) => {
    const num = Number(amount) || 0;
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

  // Only calculate totals for active subscriptions
  const { data: activeSubscriptions } = await supabase
    .from("found_values")
    .select("id, amount, billing_frequency, service_name")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "active");
  // Deduplicate active subscriptions by normalized `service_name` (fallback to id) and convert from cents to dollars
  const seenActive = new Set<string>();
  const monthlyCents = (activeSubscriptions || []).reduce((sum, sub) => {
    const keyRaw = (sub.service_name || "") .toString();
    const key = keyRaw.trim().length ? keyRaw.toLowerCase().trim() : sub.id;
    if (seenActive.has(key)) return sum;
    seenActive.add(key);
    return sum + getMonthlyAmount(sub.amount, sub.billing_frequency || "monthly");
  }, 0);

  const monthlyTotal = monthlyCents / 100;
  const annualTotal = monthlyTotal * 12;

  // Calculate lifetime savings from canceled subscriptions
  const { data: canceledSubs } = await supabase
    .from("found_values")
    .select("id, amount, billing_frequency, recovered_at, service_name")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "canceled");
  // Deduplicate canceled subscriptions by normalized `service_name` (fallback to id) and convert from cents to dollars
  const seenCanceled = new Set<string>();
  const lifetimeCents = (canceledSubs || []).reduce((sum, sub) => {
    const keyRaw = (sub.service_name || "").toString();
    const key = keyRaw.trim().length ? keyRaw.toLowerCase().trim() : sub.id;
    if (seenCanceled.has(key)) return sum;
    seenCanceled.add(key);
    const monthlySaving = getMonthlyAmount(sub.amount, sub.billing_frequency || "monthly");
    const monthsSaved = sub.recovered_at ? 
      Math.max(1, Math.floor((Date.now() - new Date(sub.recovered_at).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 
      1;
    return sum + (monthlySaving * monthsSaved);
  }, 0);

  const lifetimeSavings = lifetimeCents / 100;

  // Free tier: limit data returned
  const isFree = plan === "free";
  const PREVIEW_LIMIT = 7;
  
  // Free tier: a fixed preview of PREVIEW_LIMIT services, chosen across ALL statuses (active,
  // canceled, kept) so canceling or deleting can't pull hidden subscriptions into view.
  let previewIds: Set<string> | null = null;
  if (isFree) {
    const { data: universe } = await supabase
      .from("found_values")
      .select("id, service_name, detected_at")
      .eq("user_id", user.id)
      .eq("type", "subscription");
    previewIds = pickPreviewIds(universe || [], PREVIEW_LIMIT, {
      id: (row) => row.id,
      group: serviceKey,
      compare: (a, b) => newestFirst(a.detected_at, b.detected_at),
    });
  }

  // Deduplicate by service (first occurrence wins). Amounts are stored in cents — convert for every plan.
  const seen = new Set<string>();
  const uniqueSubs = (subscriptions || []).filter((sub) => {
    const key = serviceKey(sub);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const processedSubs = (previewIds ? uniqueSubs.filter((sub) => previewIds.has(sub.id)) : uniqueSubs)
    .map((sub) => ({ ...sub, amount: Number(sub.amount) / 100 }));

  return NextResponse.json({
    plan,
    blurred: isFree,
    previewOnly: isFree,
    previewCount: isFree ? PREVIEW_LIMIT : null,
    // Real totals for everyone (computed over all active subscriptions, not just the preview)
    monthlyTotal,
    annualTotal,
    totalCount: uniqueSubs.length, // Show count so they know what they're missing
    canceledCount: countUnique(canceledRows),
    keptCount: countUnique(keptRows),
    subscriptions: processedSubs,
    lifetimeSavings,
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ids, status } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid request: ids array required" }, { status: 400 });
  }

  if (!["canceled", "kept", "active"].includes(status)) {
    return NextResponse.json({ error: "Invalid status: must be 'canceled', 'kept', or 'active'" }, { status: 400 });
  }

  try {
    // Update the status and set recovered_at timestamp for canceled items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { status };
    if (status === "canceled") {
      updateData.recovered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("found_values")
      .update(updateData)
      .eq("user_id", user.id)
      .eq("type", "subscription")
      .in("id", ids)
      .select();

    if (error) {
      console.error("Error updating subscriptions:", error);
      return NextResponse.json({ error: "Failed to update subscriptions" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      message: `Successfully updated ${data?.length || 0} subscription(s)`
    });
  } catch (error) {
    console.error("Error in PATCH /api/dashboard/subscriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Permanently removing rows would shrink the free preview set and reveal hidden subscriptions
  const { hasPaidAccess } = await getUserPlan(supabase, user.id);
  if (!hasPaidAccess) return upgradeRequired("Upgrade to permanently remove subscriptions from your list.");

  try {
    const { error } = await supabase
      .from("found_values")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("type", "subscription");

    if (error) {
      console.error("Error permanently deleting subscription:", error);
      return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/dashboard/subscriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
