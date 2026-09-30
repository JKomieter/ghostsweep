
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get plan (free/pro)
  let plan = "free";
  const { data: planRow } = await supabase
    .from("user_subscriptions")
    .select("current_plan, renews_at, scan_credits_remaining")
    .eq("user_id", user.id)
    .maybeSingle();
  if (planRow) {
    if (planRow.current_plan === "pro") {
      const now = new Date();
      const renewsAt = planRow.renews_at ? new Date(planRow.renews_at) : null;
      if (renewsAt && renewsAt > now) plan = "pro";
    } else if (planRow.current_plan === "buster") {
      plan = "pro"; // buster always has full access
    }
  }

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
    .select("*", { count: "exact" })
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

  const { data: subscriptions, count: totalCount } = await query;

  // Get counts for different statuses
  const { count: canceledCount } = await supabase
    .from("found_values")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "canceled");

  const { count: keptCount } = await supabase
    .from("found_values")
    .select("id", { count: "exact", head: true })
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
    .select("amount, billing_frequency")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "active");

  // Convert from cents to dollars
  const monthlyTotal = (activeSubscriptions || []).reduce((sum, sub) => {
    return sum + getMonthlyAmount(sub.amount, sub.billing_frequency || "monthly");
  }, 0) / 100;

  const annualTotal = monthlyTotal * 12;

  // Calculate lifetime savings from canceled subscriptions
  const { data: canceledSubs } = await supabase
    .from("found_values")
    .select("amount, billing_frequency, recovered_at")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "canceled");

  // Convert from cents to dollars
  const lifetimeSavings = (canceledSubs || []).reduce((sum, sub) => {
    const monthlySaving = getMonthlyAmount(sub.amount, sub.billing_frequency || "monthly");
    // Estimate savings based on when they canceled (assume they've saved for at least 1 month)
    const monthsSaved = sub.recovered_at ? 
      Math.max(1, Math.floor((Date.now() - new Date(sub.recovered_at).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 
      1;
    return sum + (monthlySaving * monthsSaved);
  }, 0) / 100;

  // Free tier: blur service names and amounts, limit data returned
  const isFree = plan === "free";
  const PREVIEW_LIMIT = 7;
  
  // For free users, only return a preview slice
  const allSubs = subscriptions || [];
  const subsToReturn = isFree ? allSubs.slice(0, PREVIEW_LIMIT) : allSubs;
  
  // For free users, blur subscription details; for all users, convert amount from cents to dollars
  // Deduplicate returned subscriptions by normalized `service_name`, preserving first occurrence
  const seen = new Set<string>();
  const processedSubs: Array<Record<string, unknown>> = [];
  for (const sub of subsToReturn) {
    const key = (sub.service_name || "").toString().toLowerCase().trim();
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);

    if (isFree) {
      processedSubs.push({ ...sub });
    } else {
      processedSubs.push({ ...sub, amount: Number(sub.amount) / 100 });
    }
  }

  return NextResponse.json({
    plan,
    blurred: isFree,
    previewOnly: isFree,
    previewCount: isFree ? PREVIEW_LIMIT : null,
    monthlyTotal: isFree ? null : monthlyTotal, // Hide actual totals from free users
    annualTotal: isFree ? null : annualTotal,
    totalCount: totalCount || 0, // Show count so they know what they're missing
    canceledCount: canceledCount || 0,
    keptCount: keptCount || 0,
    subscriptions: processedSubs,
    lifetimeSavings: isFree ? null : lifetimeSavings,
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
