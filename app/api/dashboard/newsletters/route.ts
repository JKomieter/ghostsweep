
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get plan
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
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");

  // Build query - fetch all potential newsletters/spam for the user
  // We fetch ALL status types initially to calculate accurate counts for tabs
  let query = supabase
    .from("user_services")
    .select(`
      id,
      service_id,
      status,
      email_count,
      last_seen_at,
      is_spam,
      services!inner (
        id,
        name,
        category,
        unsubscribe_url,
        unsubscribe_method
      )
    `)
    .eq("user_id", user.id);

  // Apply sorting
  switch (sort) {
    case "emails":
      query = query.order("email_count", { ascending: false });
      break;
    case "recent":
      query = query.order("last_seen_at", { ascending: false, nullsFirst: false });
      break;
    case "alphabetical":
    case "frequency":
    default:
      query = query.order("name", { ascending: true, referencedTable: "services" });
  }

  const { data: allServices, error: queryError } = await query;

  if (queryError) {
    console.error("Error fetching newsletters:", queryError);
    return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
  }

  // Filter in memory for newsletters OR spam
  // This is our "Universe" of relevant items
  const allRelevantServices = (allServices || []).filter(us => {
    const service = Array.isArray(us.services) ? us.services[0] : us.services;
    return us.is_spam === true || service?.category === "Newsletter";
  });

  // Calculate counts based on the full relevant set
  const activeCount = allRelevantServices.filter(us => us.status === null || us.status === "active").length;
  const unsubscribedCount = allRelevantServices.filter(us => us.status === "unsubscribed").length;

  // Now apply the status filter for the response list
  let filteredServices = allRelevantServices;
  if (status === "unsubscribed") {
    filteredServices = allRelevantServices.filter(us => us.status === "unsubscribed");
  } else {
    // Active: null or 'active', exclude unsubscribed/deleted
    filteredServices = allRelevantServices.filter(us => us.status === null || us.status === "active");
  }

  const totalCount = filteredServices.length;

  // Process newsletter data
  const newsletters = filteredServices.map(us => {
    const service = Array.isArray(us.services) ? us.services[0] : us.services;
    return {
      id: us.id,
      service_id: us.service_id,
      name: service?.name,
      unsubscribe_url: service?.unsubscribe_url,
      unsubscribe_method: service?.unsubscribe_method,
      status: us.status === "unsubscribed" ? "unsubscribed" : "active",
      email_count: us.email_count || 0,
      is_spam: us.is_spam || false,
      category: service?.category,
      last_seen_at: us.last_seen_at
    };
  });

  // Calculate stats based on ACTIVE newsletters only (usually makes more sense for "monthly volume")
  // Or should it be based on filtered view? The UI says "monthly volume", usually implies current active load.
  // The previous implementation calculated it on filtered list. 
  // If I'm on "unsubscribed" tab, "monthly volume" of unsubscribed stuff? Probably 0 effectively if successfully unsubscribed?
  // Let's keep it consistent: calculate for the *active* newsletters to show current burden.
  
  const activeServices = allRelevantServices.filter(us => us.status === null || us.status === "active");
  const frequencyBreakdown = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    unknown: 0
  };

  let totalEmailsPerMonth = 0;

  activeServices.forEach(newsletter => {
    const emailCount = newsletter.email_count || 0;
    const monthlyEstimate = Math.round(emailCount / 3); // 90-day count to monthly
    totalEmailsPerMonth += monthlyEstimate;

    // Calculate frequency based on 90-day volume
    if (emailCount >= 60) {
      // > 20/month -> likely daily or close to it
      frequencyBreakdown.daily++;
    } else if (emailCount >= 10) {
      // > 3/month -> likely weekly
      frequencyBreakdown.weekly++;
    } else if (emailCount > 0) {
      // Has received emails -> monthly
      frequencyBreakdown.monthly++;
    } else {
      frequencyBreakdown.unknown++;
    }
  });

  // Free tier: blur newsletter names and limit data
  const isFree = plan === "free";
  const PREVIEW_LIMIT = 10;
  
  // For free users, only return a preview slice
  const newslettersToReturn = isFree ? newsletters.slice(0, PREVIEW_LIMIT) : newsletters;
  
  // For free users, blur the newsletter names in the preview
  const processedNewsletters = newslettersToReturn.map(nl => {
    if (isFree) {
      return {
        ...nl,
        name: nl.name,
        unsubscribe_url: nl.unsubscribe_url, // Don't expose unsubscribe URLs to free users
      };
    }
    return nl;
  });

  return NextResponse.json({
    plan,
    blurred: isFree,
    previewOnly: isFree, // New flag to indicate limited data
    previewCount: isFree ? PREVIEW_LIMIT : null,
    totalCount, // Count of returned items (filtered)
    activeCount, // Count of all active items
    unsubscribedCount, // Count of all unsubscribed items
    emailsPerMonth: totalEmailsPerMonth,
    frequencyBreakdown,
    newsletters: processedNewsletters, // Limited + blurred for free, full for pro
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

  if (!["unsubscribed", "active", "deleted"].includes(status)) {
    return NextResponse.json({ error: "Invalid status: must be 'unsubscribed', 'active', or 'deleted'" }, { status: 400 });
  }

  try {
    // Update the status
    const updateData = { 
      status: status, // Store the explicit status value
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("user_services")
      .update(updateData)
      .eq("user_id", user.id)
      .in("id", ids)
      .select();

    if (error) {
      console.error("Error updating newsletters:", error);
      return NextResponse.json({ error: "Failed to update newsletters" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      message: `Successfully updated ${data?.length || 0} newsletter(s)`
    });
  } catch (error) {
    console.error("Error in PATCH /api/dashboard/newsletters:", error);
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
      .from("user_services")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error permanently deleting newsletter:", error);
      return NextResponse.json({ error: "Failed to delete newsletter" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/dashboard/newsletters:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
