
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
  const status = searchParams.get("status"); // all, breached, unused, deleted
  const categoryFilter = searchParams.get("category");
  const sort = searchParams.get("sort"); // risk, alphabetical, oldest
  const search = searchParams.get("search")?.toLowerCase();
  const emailFilter = searchParams.get("email");
  const whitelistedFilter = searchParams.get("whitelisted"); // "true", "false", or null

  // Fetch all user services to perform accurate filtering and counting in memory
  // This avoids issues with PostgREST filtering on joined tables (especially NOT checks with NULLs)
  
  const [servicesRes, breachesRes, deletionRequestsRes] = await Promise.all([
    supabase
      .from("user_services")
      .select(`
        id,
        service_id,
        email_count,
        first_seen_at,
        last_seen_at,
        status,
        email,
        is_spam,
        is_whitelisted,
        services!inner (
          id,
          name,
          domain,
          category,
          logo_url,
          is_breached
        )
      `)
      .eq("user_id", user.id),
    supabase
      .from("user_breaches")
      .select("service_id")
      .eq("user_id", user.id),
    supabase
      .from("deletion_requests")
      .select("user_service_id, status, created_at, completed_at")
      .eq("user_id", user.id)
  ]);

  if (servicesRes.error) {
    console.error("Error fetching accounts:", servicesRes.error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }

  const allServices = servicesRes.data || [];
  const userBreaches = breachesRes.data || [];
  const deletionRequests = deletionRequestsRes.data || [];
  const breachedServiceIds = new Set(userBreaches.map(ub => ub.service_id));
  
  // Create a map of user_service_id -> deletion_request info
  const deletionRequestMap = new Map<string, { status: string; created_at: string; completed_at: string | null }>();
  for (const dr of deletionRequests) {
    deletionRequestMap.set(dr.user_service_id, {
      status: dr.status,
      created_at: dr.created_at,
      completed_at: dr.completed_at,
    });
  }

  // 1. Define "Accounts" universe: Not Spam AND Not Newsletter
  const allAccounts = (allServices || []).filter(us => {
    const service = Array.isArray(us.services) ? us.services[0] : us.services;
    const isNewsletter = us.is_spam === true || service?.category === "Newsletter";
    return !isNewsletter;
  });

  // 2. Calculate global stats for the "Accounts" universe
  
  // Total Active Accounts (accounts without a deletion request)
  const activeAccountsList = allAccounts.filter(us => !deletionRequestMap.has(us.id));
  const totalCount = activeAccountsList.length;

  // Breached (from active accounts)
  const breachedCount = activeAccountsList.filter(us => {
    return breachedServiceIds.has(us.service_id);
  }).length;

  // Unused (> 365 days)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoIso = oneYearAgo.toISOString();
  
  const unusedCount = activeAccountsList.filter(us => {
    return us.last_seen_at && us.last_seen_at < oneYearAgoIso;
  }).length;

  // Deleted (accounts with a deletion request)
  const deletedCount = allAccounts.filter(us => deletionRequestMap.has(us.id)).length;


  // 3. Privacy Score — fetch from user_security_scores
  const { data: scoreRow } = await supabase
    .from("user_security_scores")
    .select("score")
    .eq("user_id", user.id)
    .maybeSingle();

  const privacyScore = scoreRow?.score ?? 0;


  // 4. Apply View Filters (Status & Category)
  let filteredAccounts = allAccounts;

  // Status Filter
  if (status === "breached") {
    filteredAccounts = filteredAccounts.filter(us => {
      return !deletionRequestMap.has(us.id) && breachedServiceIds.has(us.service_id);
    });
  } else if (status === "unused") {
    filteredAccounts = filteredAccounts.filter(us => {
      return !deletionRequestMap.has(us.id) && us.last_seen_at && us.last_seen_at < oneYearAgoIso;
    });
  } else if (status === "deleted") {
    // Show accounts that have a deletion request
    filteredAccounts = filteredAccounts.filter(us => deletionRequestMap.has(us.id));
  } else {
    // Default: Show all ACTIVE accounts (without deletion requests)
    filteredAccounts = filteredAccounts.filter(us => !deletionRequestMap.has(us.id));
  }

  // Category Filter
  if (categoryFilter && categoryFilter !== "all") {
    filteredAccounts = filteredAccounts.filter(us => {
      const service = Array.isArray(us.services) ? us.services[0] : us.services;
      return service?.category === categoryFilter;
    });
  }

  // Email Filter
  if (emailFilter && emailFilter !== "all") {
    filteredAccounts = filteredAccounts.filter(us => us.email === emailFilter);
  }

  // Whitelisted Filter
  // By default, show only unwhitelisted accounts unless explicitly requesting whitelisted
  if (whitelistedFilter === "true") {
    filteredAccounts = filteredAccounts.filter(us => us.is_whitelisted === true);
  } else {
    // Default: show unwhitelisted accounts only
    filteredAccounts = filteredAccounts.filter(us => us.is_whitelisted !== true);
  }

  // Search Filter
  if (search) {
    filteredAccounts = filteredAccounts.filter(us => {
      const service = Array.isArray(us.services) ? us.services[0] : us.services;
      const name = service?.name?.toLowerCase() || "";
      const domain = service?.domain?.toLowerCase() || "";
      return name.includes(search) || domain.includes(search);
    });
  }


  // 5. Apply Sorting
  filteredAccounts.sort((a, b) => {
    const serviceA = Array.isArray(a.services) ? a.services[0] : a.services;
    const serviceB = Array.isArray(b.services) ? b.services[0] : b.services;

    if (sort === "alphabetical") {
      return (serviceA?.name || "").localeCompare(serviceB?.name || "");
    } else if (sort === "oldest") {
      const dateA = a.first_seen_at ? new Date(a.first_seen_at).getTime() : 0;
      const dateB = b.first_seen_at ? new Date(b.first_seen_at).getTime() : 0;
      return dateA - dateB;
    } else {
      // "risk": Breached first, then unused (oldest last seen), then others
      const isBreachedA = breachedServiceIds.has(a.service_id);
      const isBreachedB = breachedServiceIds.has(b.service_id);
      
      if (isBreachedA !== isBreachedB) {
        return isBreachedA ? -1 : 1;
      }
      // If same breach status, sort by last_seen ascending (older = more risky/unused)
      const dateA = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
      const dateB = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
      return dateA - dateB;
    }
  });


  // 6. Map to Response Format
  const accounts = filteredAccounts.map(us => {
    const service = Array.isArray(us.services) ? us.services[0] : us.services;
    
    // Calculate days since last seen
    let daysSinceLastSeen = null;
    if (us.last_seen_at) {
      const lastSeen = new Date(us.last_seen_at);
      const now = new Date();
      daysSinceLastSeen = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
    }

    const isBreached = breachedServiceIds.has(us.service_id);
    const deletionRequest = deletionRequestMap.get(us.id);

    return {
      id: us.id,
      service_id: us.service_id,
      name: service?.name,
      domain: service?.domain,
      category: service?.category,
      logo_url: service?.logo_url,
      is_breached: isBreached,
      email_count: us.email_count || 0,
      first_seen_at: us.first_seen_at,
      last_seen_at: us.last_seen_at,
      status: us.status,
      email: us.email,
      is_whitelisted: us.is_whitelisted || false,
      days_since_last_seen: daysSinceLastSeen,
      risk_level: isBreached ? "high" : (daysSinceLastSeen && daysSinceLastSeen > 365 ? "medium" : "low"),
      deletion_request: deletionRequest ? {
        status: deletionRequest.status,
        created_at: deletionRequest.created_at,
        completed_at: deletionRequest.completed_at,
      } : null,
    };
  });

  // Extract unique emails from the full "Accounts" universe (not just filtered)
  const availableEmails = Array.from(new Set(
    allAccounts
      .map(a => a.email)
      .filter((e): e is string => typeof e === 'string' && e.length > 0)
  ));

  // Free tier: Only send a preview (first 5 accounts) with blurred names
  // This prevents free users from seeing all their data in devtools
  const isFree = plan === "free";
  const PREVIEW_LIMIT = 5;
  
  // For free users, only return a preview slice
  const accountsToReturn = isFree ? accounts.slice(0, PREVIEW_LIMIT) : accounts;
  
  // For free users, blur the account names in the preview
  const processedAccounts = accountsToReturn.map(acc => {
    if (isFree) {
      return {
        ...acc,
        name: acc.name ? acc.name.substring(0, 2) + "••••••" : null,
        domain: acc.domain ? "••••••." + (acc.domain.split('.').pop() || "com") : null,
        email: acc.email ? acc.email.substring(0, 2) + "••••••@••••••.com" : null,
      };
    }
    return acc;
  });
  
  return NextResponse.json({
    plan,
    blurred: isFree,
    previewOnly: isFree, // New flag to indicate limited data
    previewCount: isFree ? PREVIEW_LIMIT : null,
    privacyScore,
    totalCount: totalCount || 0,
    breachedCount: breachedCount || 0,
    unusedCount: unusedCount || 0,
    deletedCount: deletedCount || 0,
    availableEmails: isFree ? [] : availableEmails, // Don't expose emails to free users
    accounts: processedAccounts // Limited + blurred for free, full for pro
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ids, status, is_whitelisted } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid request: ids array required" }, { status: 400 });
  }

  // Validate inputs: either status update OR whitelist update (or both?)
  // If status is provided, validate it.
  if (status && !["deleted", "active"].includes(status)) {
    return NextResponse.json({ error: "Invalid status: must be 'deleted' or 'active'" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { 
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (typeof is_whitelisted !== "undefined") updateData.is_whitelisted = is_whitelisted;

    const { data, error } = await supabase
      .from("user_services")
      .update(updateData)
      .eq("user_id", user.id)
      .in("id", ids)
      .select();

    if (error) {
      console.error("Error updating accounts:", error);
      return NextResponse.json({ error: "Failed to update accounts" }, { status: 500 });
    }

    // If marking as deleted, create deletion_requests for each account
    if (status === "deleted" && data && data.length > 0) {
      const now = new Date().toISOString();
      const deletionRequests = data.map((userService) => ({
        user_id: user.id,
        user_service_id: userService.id,
        status: "completed" as const,
        updated_at: now,
        completed_at: now,
      }));

      // Use upsert to handle cases where deletion request already exists
      const { error: deletionError } = await supabase
        .from("deletion_requests")
        .upsert(deletionRequests, {
          onConflict: "user_id,user_service_id",
          ignoreDuplicates: false,
        });

      if (deletionError) {
        console.error("Error creating deletion requests:", deletionError);
        // Don't fail the request, the user_service was already updated
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      message: `Successfully updated ${data?.length || 0} account(s)`
    });
  } catch (error) {
    console.error("Error in PATCH /api/dashboard/accounts:", error);
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
    // Delete associated deletion requests first
    await supabase
      .from("deletion_requests")
      .delete()
      .eq("user_service_id", id)
      .eq("user_id", user.id);

    // Delete the user service
    const { error } = await supabase
      .from("user_services")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error permanently deleting account:", error);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/dashboard/accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
