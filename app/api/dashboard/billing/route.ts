
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Billing info (plan, payment method, history)
  const { data: plan } = await supabase
    .from("plan")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: history } = await supabase
    .from("billing_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ plan, history: history || [] });
}
