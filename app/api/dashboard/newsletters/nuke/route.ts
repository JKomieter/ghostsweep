// app/api/dashboard/newsletters/nuke/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Pro
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("current_plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscription?.current_plan !== "pro") {
      return NextResponse.json(
        { error: "Upgrade to Pro to use Nuke the Noise" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No user_service IDs provided" },
        { status: 400 }
      );
    }

    // Get the user_services to nuke (verify they belong to the user)
    // Join with services to get the unsubscribe_url
    const { data: userServices, error: fetchError } = await supabase
      .from("user_services")
      .select(`
        id,
        service_id,
        services (
          id,
          name,
          unsubscribe_url,
          unsubscribe_method
        )
      `)
      .in("id", ids)
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Error fetching user_services:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch newsletters" },
        { status: 500 }
      );
    }

    if (!userServices || userServices.length === 0) {
      return NextResponse.json(
        { error: "No valid newsletters found" },
        { status: 404 }
      );
    }

    // Mark all as unsubscribed
    const { error: updateError } = await supabase
      .from("user_services")
      .update({ status: "unsubscribed" })
      .in("id", ids)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating user_services status:", updateError);
      return NextResponse.json(
        { error: "Failed to update newsletter status" },
        { status: 500 }
      );
    }

    // Return the unsubscribe URLs so frontend can open them
    const unsubscribeUrls = userServices
      .filter(us => us.services && (us.services as { unsubscribe_url?: string }).unsubscribe_url)
      .map(us => {
        const serviceArray = us.services as { id: string; name: string; unsubscribe_url: string }[];
        const service = Array.isArray(serviceArray) ? serviceArray[0] : serviceArray;
        return {
          id: us.id,
          name: service?.name,
          url: service?.unsubscribe_url
        };
      });

    return NextResponse.json({
      success: true,
      unsubscribedCount: userServices.length,
      urlsToOpen: unsubscribeUrls,
      message: `Marked ${userServices.length} newsletters as unsubscribed`,
    });

  } catch (error) {
    console.error("Error in nuke endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
