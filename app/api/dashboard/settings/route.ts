
import { createClient } from "@/utils/supabase/server";
import {  NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Connected accounts, scan settings, notification preferences, billing, account management
  // For demo, just return connected Gmail
  const { data: emails } = await supabase
    .from("gmail_account")
    .select("*")
    .eq("user_id", user.id);

  return NextResponse.json({ connected: emails || [] });
}
