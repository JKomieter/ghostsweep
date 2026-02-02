import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with your actual Supabase URL and anon key
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  
      // 1) Auth
      const {
          data: { user },
          error: userError,
      } = await supabase.auth.getUser();
  
      if (userError || !user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

  // Total value found
  const { data: valueRows } = await supabase
    .from("found_values")
    .select("amount")
    .eq("user_id", user.id)
    .eq("status", "active");
  // Convert from cents to dollars
  const totalValue = (valueRows?.reduce((sum, row) => sum + Number(row.amount), 0) || 0) / 100;

  // Active subscriptions
  const { data: subRows } = await supabase
    .from("found_values")
    .select("amount")
    .eq("user_id", user.id)
    .eq("type", "subscription")
    .eq("status", "active");
  // Convert from cents to dollars
  const totalSubs = (subRows?.reduce((sum, row) => sum + Number(row.amount), 0) || 0) / 100;

  // Newsletters count (include both spam and newsletter category services)
  const { data: allUserServices } = await supabase
    .from("user_services")
    .select(`
      id,
      is_spam,
      status,
      services!inner (
        category
      )
    `)
    .eq("user_id", user.id);

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

  // Old accounts count
  const { data: oldRows } = await supabase
    .from("user_services")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_account", true)
    .eq("is_spam", false);
  const oldAccounts = oldRows?.length || 0;

  // Recent findings (last 5 found_values)
  const { data: recent } = await supabase
    .from("found_values")
    .select("*")
    .eq("user_id", user.id)
    .order("detected_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    totalValue,
    totalSubs,
    newsletters,
    oldAccounts,
    recent: recent || [],
  });
}
