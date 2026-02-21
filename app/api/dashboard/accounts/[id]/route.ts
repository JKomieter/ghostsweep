import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Fetch the user service with related service data
  const { data: userService, error: serviceError } = await supabase
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (serviceError || !userService) {
    console.error("Error fetching account:", serviceError);
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Check if user has breaches for this service
  const [breachesRes, playbookRes, deletionRequestRes] = await Promise.all([
    supabase
      .from("user_breaches")
      .select(`
        id,
        breaches (
          id,
          name,
          breach_date,
          description
        )
      `)
      .eq("user_id", user.id)
      .eq("service_id", userService.service_id),
    supabase
      .from("service_deletion_playbooks")
      .select(`
        id,
        deletion_url,
        deletion_email,
        deletion_method,
        deletion_difficulty,
        steps,
        data_retention_notes,
        data_deletion_info,
        identity_verification_notes,
        subject_suggestion,
        confidence
      `)
      .eq("service_id", userService.service_id)
      .maybeSingle(),
    supabase
      .from("deletion_requests")
      .select("id, status, created_at, sent_at, completed_at, follow_up_count, deletion_method")
      .eq("user_id", user.id)
      .eq("user_service_id", id)
      .maybeSingle()
  ]);

  const userBreaches = breachesRes.data;
  const playbook = playbookRes.data;
  const deletionRequest = deletionRequestRes.data;

  const isBreached = (userBreaches?.length ?? 0) > 0;

  // Calculate days since last seen
  let daysSinceLastSeen: number | null = null;
  if (userService.last_seen_at) {
    const lastSeen = new Date(userService.last_seen_at);
    const now = new Date();
    daysSinceLastSeen = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Get service data
  const service = Array.isArray(userService.services) ? userService.services[0] : userService.services;

  // Format breaches
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const breaches = (userBreaches || []).map((ub: any) => {
    const breach = Array.isArray(ub.breaches) ? ub.breaches[0] : ub.breaches;
    return {
      id: ub.id,
      breach_name: breach?.name || "Unknown Breach",
      breach_date: breach?.breach_date,
      description: breach?.description,
    };
  });

  // Build response
  const account = {
    id: userService.id,
    service_id: userService.service_id,
    name: service?.name || "Unknown",
    domain: service?.domain || "",
    category: service?.category || "Unknown",
    logo_url: service?.logo_url || null,
    is_breached: isBreached,
    email_count: userService.email_count || 0,
    first_seen_at: userService.first_seen_at,
    last_seen_at: userService.last_seen_at,
    status: userService.status,
    email: userService.email,
    is_whitelisted: userService.is_whitelisted || false,
    days_since_last_seen: daysSinceLastSeen,
    risk_level: isBreached ? "high" : (daysSinceLastSeen && daysSinceLastSeen > 365 ? "medium" : "low"),
    breaches,
    playbook: playbook ? {
      id: playbook.id,
      deletion_url: playbook.deletion_url,
      deletion_email: playbook.deletion_email,
      deletion_method: playbook.deletion_method,
      deletion_difficulty: playbook.deletion_difficulty,
      steps: playbook.steps,
      data_retention_notes: playbook.data_retention_notes,
      data_deletion_info: playbook.data_deletion_info,
      identity_verification_notes: playbook.identity_verification_notes,
      subject_suggestion: playbook.subject_suggestion,
      confidence: playbook.confidence,
    } : null,
    deletion_request: deletionRequest ? {
      id: deletionRequest.id,
      status: deletionRequest.status,
      created_at: deletionRequest.created_at,
      sent_at: deletionRequest.sent_at,
      completed_at: deletionRequest.completed_at,
      follow_up_count: deletionRequest.follow_up_count,
      deletion_method: deletionRequest.deletion_method,
    } : null,
  };

  return NextResponse.json(account);
}
