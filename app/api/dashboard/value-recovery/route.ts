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
  const type = searchParams.get("type"); // gift_card, coupon, rewards, refund, or null for all
  const status = searchParams.get("status"); // detected, recovered, expired, ignored
  const sort = searchParams.get("sort"); // value, expiry, recent

  const allowedTypes = ["gift_card", "coupon", "rewards", "refund"];
  const allowedStatuses = ["active", "recovered", "expired", "ignored"];

  let query = supabase
    .from("found_values")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .in("type", allowedTypes)
    .in("status", allowedStatuses);

  if (type && allowedTypes.includes(type)) {
    query = query.eq("type", type);
  }
  if (status && allowedStatuses.includes(status)) {
    query = query.eq("status", status);
  }
  if (sort === "value") {
    query = query.order("amount", { ascending: false });
  } else if (sort === "expiry") {
    query = query.order("expires_at", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("detected_at", { ascending: false });
  }

  const { data: values, count: totalCount } = await query;

  // Progress
  const { count: recoveredCount } = await supabase
    .from("found_values")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("type", ["gift_card", "coupon", "rewards", "refund"])
    .eq("status", "recovered");

  // Convert from cents to dollars
  const totalValue = (values || []).reduce((sum, v) => sum + (Number(v.amount) || 0), 0) / 100;
  const recoveredValue = (values || []).filter(v => v.status === "recovered").reduce((sum, v) => sum + (Number(v.amount) || 0), 0) / 100;

  // Free tier: blur codes, block copy, block links, limit data returned
  const isFree = plan === "free";
  const PREVIEW_LIMIT = 10;
  
  // For free users, only return a preview slice
  const allValues = values || [];
  const valuesToReturn = isFree ? allValues.slice(0, PREVIEW_LIMIT) : allValues;
  
  // For free users, blur value details; for all users, convert amount from cents to dollars
  const processedValues = valuesToReturn.map(val => {
    if (isFree) {
      return {
        ...val,
        // source: val.source ? val.source.substring(0, 2) + "••••••" : null,
        // amount: "••.••",
        // code: val.code ? "••••-••••-••••" : null, // Hide gift card codes
        // redemption_url: null, // Can't redeem without paying
        // original_email_id: null,
        // // Always include risk protection fields - they're safety critical
        // risk_level: val.risk_level || "unknown",
        // is_verified: val.is_verified ?? false,
        // warning_message: val.warning_message,
      };
    }
    return {
      ...val,
      amount: Number(val.amount) / 100, // Convert from cents to dollars
      // Ensure risk fields are always present
      risk_level: val.risk_level || "unknown",
      is_verified: val.is_verified ?? false,
      warning_message: val.warning_message,
    };
  });

  return NextResponse.json({
    plan,
    blurred: isFree,
    previewOnly: isFree,
    previewCount: isFree ? PREVIEW_LIMIT : null,
    totalValue: isFree ? null : totalValue, // Hide actual value from free users
    recoveredValue: isFree ? null : recoveredValue,
    totalCount: totalCount || 0, // Show count so they know what they're missing
    recoveredCount: recoveredCount || 0,
    values: processedValues,
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ids, action } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid request: ids array required" }, { status: 400 });
  }

  if (action !== "recover") {
    return NextResponse.json({ error: "Invalid action: only 'recover' is supported" }, { status: 400 });
  }

  try {
    // Update the status to 'recovered' and set recovered_at timestamp
    const { data, error } = await supabase
      .from("found_values")
      .update({ 
        status: "recovered", 
        recovered_at: new Date().toISOString() 
      })
      .eq("user_id", user.id)
      .in("id", ids)
      .select();

    if (error) {
      console.error("Error updating values:", error);
      return NextResponse.json({ error: "Failed to update values" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      message: `Successfully marked ${data?.length || 0} item(s) as recovered`
    });
  } catch (error) {
    console.error("Error in PATCH /api/dashboard/value-recovery:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
