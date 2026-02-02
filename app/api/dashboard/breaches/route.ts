
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Breached accounts
  const { data: breached } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_account", true)
    .eq("is_spam", false)
    .eq("is_breached", true);

  return NextResponse.json({ breached: breached || [] });
}
