// app/api/sweep/run/route.ts (in your Next.js app)
import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get email and provider from query params
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const emailProvider = searchParams.get("email_provider") as "gmail" | "outlook" | null;

    // ✅ Get user from session (this is automatic in Next.js)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ User ID comes from the authenticated session
    const userId = user.id;

    // Validate required parameters
    if (!email || !emailProvider) {
      return NextResponse.json(
        { error: "Missing required parameters: email and email_provider", code: "MISSING_PARAMETERS" },
        { status: 400 }
      );
    }

    if (!["gmail", "outlook"].includes(emailProvider)) {
      return NextResponse.json(
        { error: "Invalid email_provider. Must be 'gmail' or 'outlook'", code: "INVALID_PROVIDER" },
        { status: 400 }
      );
    }

    // ✅ ENFORCE: Check if sweep already in progress
    const { data: existingSweep, error: sweepCheckError } = await supabase
      .from("sweep_events")
      .select("id, status, started_at")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (sweepCheckError && sweepCheckError.code !== "PGRST116") {
      console.error("Error checking existing sweeps:", sweepCheckError);
      return NextResponse.json(
        { error: "Failed to check sweep status" },
        { status: 500 }
      );
    }

    if (existingSweep) {
      // Calculate how long it's been running
      const elapsed = Date.now() - new Date(existingSweep.started_at).getTime();
      const minutesElapsed = Math.floor(elapsed / 60000);

      return NextResponse.json(
        {
          error: "Sweep already in progress",
          code: "SWEEP_IN_PROGRESS",
          sweepId: existingSweep.id,
          status: existingSweep.status,
          minutesElapsed,
          message: `A sweep is already ${existingSweep.status}. Please wait for it to complete (${minutesElapsed} minutes elapsed).`,
        },
        { status: 409 } // 409 Conflict
      );
    }

    // ✅ CHECK FREE USER MONTHLY LIMIT
    const { data: subscriptionData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("current_plan")
      .eq("user_id", userId)
      .maybeSingle();

    if (subError && subError.code !== "PGRST116") {
      console.error("Error checking subscription:", subError);
      return NextResponse.json(
        { error: "Failed to check subscription status" },
        { status: 500 }
      );
    }

    const currentPlan = (subscriptionData?.current_plan ?? "free") as "free" | "pro";
    
    // If free user, check if they've already completed a scan this month
    if (currentPlan === "free") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const { data: completedScans, error: scanCountError } = await supabase
        .from("sweep_events")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed")
        .gte("completed_at", monthStart.toISOString())
        .lte("completed_at", monthEnd.toISOString());

      if (scanCountError && scanCountError.code !== "PGRST116") {
        console.error("Error checking scan count:", scanCountError);
        return NextResponse.json(
          { error: "Failed to check scan limit" },
          { status: 500 }
        );
      }

      const completedScansCount = completedScans?.length ?? 0;

      if (completedScansCount >= 1) {
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const daysUntilReset = Math.ceil((nextMonthStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return NextResponse.json(
          {
            error: "Monthly scan limit reached",
            code: "MONTHLY_LIMIT_REACHED",
            limit: 1,
            resetIn: daysUntilReset,
            message: `Free users are limited to 1 scan per month. Your next scan will be available in ${daysUntilReset} day${daysUntilReset === 1 ? '' : 's'}. Upgrade to Pro for unlimited scans.`,
          },
          { status: 429 } // 429 Too Many Requests
        );
      }
    }

    // Check if Gmail or Microsoft accounts connected
    const { data: gmailAccounts } = await supabase
      .from("gmail_accounts")
      .select("gmail_address")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: microsoftAccounts } = await supabase
      .from("microsoft_accounts")
      .select("outlook_address")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Verify the specified email account exists and belongs to this user
    let accountExists = false;
    
    if (emailProvider === "gmail") {
      accountExists = gmailAccounts?.some(acc => acc.gmail_address === email) ?? false;
      if (!accountExists) {
        return NextResponse.json(
          { error: "Gmail account not found or not connected", code: "GMAIL_NOT_FOUND" },
          { status: 404 }
        );
      }
    } else if (emailProvider === "outlook") {
      accountExists = microsoftAccounts?.some(acc => acc.outlook_address === email) ?? false;
      if (!accountExists) {
        return NextResponse.json(
          { error: "Outlook account not found or not connected", code: "OUTLOOK_NOT_FOUND" },
          { status: 404 }
        );
      }
    }

    // ✅ Get user location from IP address
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    let userLocation = "Remote";
    
    try {
      // Skip localhost IPs
      if (ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
        const locResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        if (locResponse.ok) {
          const locData = await locResponse.json();
          if (locData.city && !locData.error) {
            userLocation = locData.region_code 
              ? `${locData.city}, ${locData.region_code}` 
              : locData.city;
          }
        }
      }
    } catch (locError) {
      // Silently fail - location is optional
      console.warn("Failed to fetch user location:", locError);
    }

    // ✅ Create sweep job with user_id and email provider
    const { data: sweepEvent, error: sweepError } = await supabase
      .from("sweep_events")
      .insert({
        user_id: userId,
        email_provider: emailProvider,
        email: email,
        status: "pending",
        started_at: new Date().toISOString(),
        location_text: userLocation,
      })
      .select("id")
      .single();

    if (sweepError || !sweepEvent) {
      console.error("Failed to create sweep job: ", sweepError)
      return NextResponse.json(
        { error: "Failed to create sweep job" },
        { status: 500 }
      );
    }

    // ✅ Return immediately - worker picks it up
    return NextResponse.json(
      {
        message: "Sweep queued successfully",
        sweepId: sweepEvent.id,
        status: "pending",
        email: email,
        provider: emailProvider,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error starting sweep:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}