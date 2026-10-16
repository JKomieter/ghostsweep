import { createClient } from "@/utils/supabase/server";
import { getUserPlan } from "@/lib/entitlements";
import { newestFirst, pickPreviewIds } from "@/lib/free-preview";
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

  // Convert from cents to dollars. "Recoverable" = still-active items only (matches the dashboard overview);
  // already-recovered value is reported separately.
  const centsOf = (v: { amount: unknown }) => Number(v.amount) || 0;
  const totalValue = (values || []).filter(v => v.status === "active").reduce((sum, v) => sum + centsOf(v), 0) / 100;
  const recoveredValue = (values || []).filter(v => v.status === "recovered").reduce((sum, v) => sum + centsOf(v), 0) / 100;

  // Free tier: preview slice only, with codes/links locked
  const isFree = plan === "free";
  const PREVIEW_LIMIT = 10;

  // Free tier: a fixed preview of the newest PREVIEW_LIMIT items, chosen across ALL types and statuses
  // so recovering/ignoring items can't pull hidden ones (or their codes) into view.
  let previewIds: Set<string> | null = null;
  let freeRevealId: string | null = null;
  if (isFree) {
    const { data: universe } = await supabase
      .from("found_values")
      .select("id, detected_at, amount, code, pin, redemption_url, risk_level")
      .eq("user_id", user.id)
      .in("type", allowedTypes)
      .in("status", allowedStatuses);
    const rows = universe || [];
    previewIds = pickPreviewIds(rows, PREVIEW_LIMIT, {
      id: (v) => v.id,
      compare: (a, b) => newestFirst(a.detected_at, b.detected_at),
    });

    // Free users get the code for their single most valuable safe preview item, so they can redeem
    // something real and see the product works. Chosen regardless of status, so it never moves on.
    freeRevealId = rows
      .filter(v => previewIds!.has(v.id) && v.risk_level !== "high_risk" && (v.code || v.pin || v.redemption_url))
      .sort((x, y) => centsOf(y) - centsOf(x) || x.id.localeCompare(y.id))[0]?.id ?? null;
  }

  const allValues = values || [];
  const valuesToReturn = previewIds ? allValues.filter(v => previewIds.has(v.id)) : allValues;

  // Amounts are stored in cents — convert for every plan so free and paid users see the same numbers
  const processedValues = valuesToReturn.map(val => {
    const locked = isFree && val.id !== freeRevealId;
    return {
      ...val,
      amount: Number(val.amount) / 100,
      // Risk fields are safety critical, so always present
      risk_level: val.risk_level || "unknown",
      is_verified: val.is_verified ?? false,
      warning_message: val.warning_message,
      locked,
      has_secret: Boolean(val.code || val.pin || val.redemption_url),
      ...(locked
        ? { code: null, pin: null, redemption_url: null, email_body_snippet: null } // snippet can contain the code
        : {}),
    };
  });

  return NextResponse.json({
    plan,
    blurred: isFree,
    previewOnly: isFree,
    previewCount: isFree ? PREVIEW_LIMIT : null,
    // Real totals for everyone (computed over all items, not just the preview) — seeing the full
    // amount is what makes the upgrade worth it; paying unlocks the rest of the list and recovery
    totalValue,
    recoveredValue,
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
