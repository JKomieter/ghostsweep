import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();

  // 1. Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found", userError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Update notifications (mark all unread as read)
  // const { error: updateError } = await supabase
  //   .from("user_notifications")
  //   .update({ read: true })
  //   .eq("user_id", user.id)
  //   .eq("read", false)

  // if (updateError) {
  //   console.error("Error marking notifications read:", updateError);
  //   return NextResponse.json(
  //     { error: "Failed to update notifications" },
  //     { status: 500 }
  //   );
  // }

  return NextResponse.json({
    success: true,
  });
}