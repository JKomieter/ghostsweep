import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["active", "ignored", "deleted"] as const;

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("shadow_profiles")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("Shadow profile PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("shadow_profiles")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shadow profile DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch shadow profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("shadow_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("risk_level", { ascending: false });

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Fetch breach links for this user's shadow profiles
    const { data: breachLinks, error: breachError } = await supabase
      .from("shadow_profile_breaches")
      .select("shadow_profile_id, breach_id")
      .eq("user_id", user.id);

    if (breachError) {
      return NextResponse.json({ error: breachError.message }, { status: 500 });
    }

    // Fetch security score
    const { data: securityScore } = await supabase
      .from("user_security_scores")
      .select("score, vulnerability_score, last_calculated_at")
      .eq("user_id", user.id)
      .single();

    // Fetch user selectors
    const { data: selectors } = await supabase
      .from("user_selectors")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: true });

    // Fetch plan
    const { data: plan } = await supabase
      .from("user_subscriptions")
      .select("current_plan")
      .eq("user_id", user.id)
      .single();

    // Build breach set for quick lookup
    const breachedProfileIds = new Set(
      (breachLinks ?? []).map((b) => b.shadow_profile_id)
    );

    const enrichedProfiles = (profiles ?? []).map((p) => ({
      ...p,
      has_breach: breachedProfileIds.has(p.id),
    }));

    const criticalCount = enrichedProfiles.filter(
      (p) => p.has_breach || p.risk_level >= 4
    ).length;

    const isPremium =
      plan?.current_plan === "pro"
    const FREE_TIER_LIMIT = 5;
    const visibleProfiles = isPremium
      ? enrichedProfiles
      : enrichedProfiles.slice(0, FREE_TIER_LIMIT);
    const hiddenCount = isPremium
      ? 0
      : Math.max(0, enrichedProfiles.length - FREE_TIER_LIMIT);

    return NextResponse.json({
      profiles: visibleProfiles,
      totalCount: enrichedProfiles.length,
      hiddenCount,
      criticalCount,
      securityScore: securityScore ?? null,
      selectors: selectors ?? [],
      isPremium,
    });
  } catch (error) {
    console.error("Shadow profiles API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
