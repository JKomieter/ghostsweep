import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 50;
const FREE_ACCOUNT_LIMIT = 10;

const ALLOWED_STATUSES = new Set([
    "drafted",
    "sent",
    "received",
    "needs_verification",
    "in_progress",
    "completed",
    "failed",
    "expired",
]);

function parseBool(v: string | null): boolean | null {
    if (v == null || v === "") return null;
    if (["true", "1", "yes"].includes(v.toLowerCase())) return true;
    if (["false", "0", "no"].includes(v.toLowerCase())) return false;
    return null;
}

function parseCsv(v: string | null): string[] {
    if (!v) return [];
    return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get plan
        const { data: subscriptionData, error: subscriptionError } = await supabase
            .from("user_subscriptions")
            .select("current_plan")
            .eq("user_id", user.id)
            .maybeSingle();

        if (subscriptionError) {
            console.error("Error fetching user subscription:", subscriptionError);
            return NextResponse.json(
                { error: "Internal Server Error", code: "SUBSCRIPTION_FETCH_ERROR" },
                { status: 500 }
            );
        }

        const currentPlan = (subscriptionData?.current_plan || "free") as "free" | "pro";
        const isPro = currentPlan === "pro";

        // Query params
        const { searchParams } = new URL(request.url);

        const searchQuery = searchParams.get("query")?.trim() || "";
        const category = searchParams.get("category")?.trim() || "";
        const breachedParam = searchParams.get("breached")?.trim() || "";
        const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
        const emailParam = searchParams.get("email")?.trim() || "";

        // New filters
        const statusParam = searchParams.get("status");
        const startedParam = searchParams.get("started");
        const confidenceParam = searchParams.get("confidence")?.trim() || "";
        const emailCountParam = searchParams.get("email_count")?.trim() || "";
        const ageParam = searchParams.get("age")?.trim() || "";

        // Breached filter
        let breachedFilter: boolean | null = null;
        if (breachedParam === "breached" || breachedParam === "true" || breachedParam === "1") {
            breachedFilter = true;
        } else if (breachedParam === "unbreached" || breachedParam === "false" || breachedParam === "0") {
            breachedFilter = false;
        }

        // Status filter
        const statusList = parseCsv(statusParam).filter((s) => ALLOWED_STATUSES.has(s));

        // Started filter
        const startedFilter = parseBool(startedParam);

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // ===========================
        // Build base query filters
        // ===========================
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function applyFilters(query: any) {
            if (searchQuery) {
                query = query.or(
                    `name.ilike.%${searchQuery}%,domain.ilike.%${searchQuery}%`,
                    { foreignTable: "services" }
                );
            }

            if (category) {
                query = query.eq("services.category", category);
            }

            // Email filter
            if (emailParam) {
                query = query.eq("email", emailParam);
            }

            // Started filter
            if (startedFilter === true) {
                query = query.not("deletion_requests.id", "is", null);
            } else if (startedFilter === false) {
                query = query.is("deletion_requests.id", null);
            }

            // Status filter
            if (statusList.length > 0) {
                query = query.in("deletion_requests.status", statusList);
            }

            // Confidence filter
            if (confidenceParam === "high") {
                query = query.gte("confidence_score", 80);
            } else if (confidenceParam === "medium") {
                query = query.gte("confidence_score", 50).lt("confidence_score", 80);
            } else if (confidenceParam === "low") {
                query = query.lt("confidence_score", 50);
            }

            // Email count filter
            if (emailCountParam === "0-1") {
                query = query.lte("email_count", 1);
            } else if (emailCountParam === "2-10") {
                query = query.gte("email_count", 2).lte("email_count", 10);
            } else if (emailCountParam === "10+") {
                query = query.gte("email_count", 10);
            }

            // Age filter
            if (ageParam) {
                const now = new Date();

                if (ageParam === "30d") {
                    const d = new Date(now);
                    d.setDate(d.getDate() - 30);
                    query = query.gte("first_seen_at", d.toISOString());
                } else if (ageParam === "3-6m") {
                    const start = new Date(now);
                    start.setMonth(start.getMonth() - 6);
                    const end = new Date(now);
                    end.setMonth(end.getMonth() - 3);
                    query = query.gte("first_seen_at", start.toISOString()).lte("first_seen_at", end.toISOString());
                } else if (ageParam === "6-12m") {
                    const start = new Date(now);
                    start.setMonth(start.getMonth() - 12);
                    const end = new Date(now);
                    end.setMonth(end.getMonth() - 6);
                    query = query.gte("first_seen_at", start.toISOString()).lte("first_seen_at", end.toISOString());
                } else if (ageParam === "1y+") {
                    const end = new Date(now);
                    end.setFullYear(end.getFullYear() - 1);
                    query = query.lte("first_seen_at", end.toISOString());
                }
            }

            return query;
        }

        // ===========================
        // Count query (always get full count)
        // ===========================
        let countQuery = supabase
            .from("user_services")
            .select(
                `
                id,
                service:services!inner (id),
                deletion_request:deletion_requests!deletion_requests_user_service_id_fkey (id,status)
            `,
                { count: "exact", head: true }
            )
            .eq("user_id", user.id)
            .limit(1, { foreignTable: "deletion_requests" });

        countQuery = applyFilters(countQuery);

        const { count: serviceCount, error: countError } = await countQuery;

        if (countError) {
            console.error("Error counting user services:", countError);
            return NextResponse.json(
                { error: "Internal Server Error", code: "USER_SERVICES_COUNT_ERROR" },
                { status: 500 }
            );
        }

        const totalCount = serviceCount ?? 0;

        // ===========================
        // 🔥 FREE TIER GATING
        // ===========================
        const isGated = !isPro && totalCount > FREE_ACCOUNT_LIMIT;
        // const effectiveLimit = isPro ? to : Math.min(to, FREE_ACCOUNT_LIMIT - 1);

        let query = supabase
            .from("user_services")
            .select(
                `
                id,
                user_id,
                service_id,
                first_seen_at,
                last_seen_at,
                email_count,
                confidence_score,
                email,
                email_provider,
                service:services!inner (*),
                deletion_request:deletion_requests!deletion_requests_user_service_id_fkey (*)
            `
            )
            .eq("user_id", user.id)
            .order("last_seen_at", { ascending: false, nullsFirst: false })
            .limit(1, { foreignTable: "deletion_requests" });

        query = applyFilters(query);

        // 🔥 Apply free tier limit
        if (isPro) {
            query = query.range(from, to);
        } else {
            // Free users: only show first 10 accounts
            query = query.range(0, FREE_ACCOUNT_LIMIT - 1);
        }

        const { data: userServices, error } = await query;

        if (error) {
            console.error("Error fetching user services:", error);
            return NextResponse.json(
                { error: "Internal Server Error", code: "USER_SERVICES_NOT_FOUND" },
                { status: 500 }
            );
        }

        // Fetch user_breaches to determine which services are breached
        const { data: userBreachesData, error: breachesError } = await supabase
            .from("user_breaches")
            .select("service_id, id")
            .eq("user_id", user.id);

        if (breachesError) {
            console.error("Error fetching user breaches:", breachesError);
            return NextResponse.json(
                { error: "Internal Server Error", code: "BREACHES_FETCH_ERROR" },
                { status: 500 }
            );
        }

        // Create a map of service_id -> breaches
        const breachesMap = new Map<string, Array<{ id: string }>>();
        (userBreachesData ?? []).forEach((ub: { service_id: string; id: string }) => {
            if (!breachesMap.has(ub.service_id)) {
                breachesMap.set(ub.service_id, []);
            }
            breachesMap.get(ub.service_id)!.push({ id: ub.id });
        });

        // Add user_breaches to each service
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const servicesWithBreaches = (userServices ?? []).map((us: any) => ({
            ...us,
            user_breaches: breachesMap.get(us.service_id) ?? [],
        }));

        // Apply breach filter based on user_breaches (not services.is_breached)
        let filteredServices = servicesWithBreaches;
        if (breachedFilter !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filteredServices = filteredServices.filter((us: any) => {
                // Check if user has any breaches for this service (via user_breaches table)
                const hasUserBreaches = (us.user_breaches?.length ?? 0) > 0;
                return breachedFilter ? hasUserBreaches : !hasUserBreaches;
            });
        }

        return NextResponse.json({
            userServices: filteredServices,
            total: totalCount,
            shownCount: filteredServices.length,
            hiddenCount: isGated ? totalCount - FREE_ACCOUNT_LIMIT : 0,
            page,
            pageSize: PAGE_SIZE,
            hasMore: isPro ? (typeof totalCount === "number" ? to + 1 < totalCount : false) : false,
            gated: isGated,
            currentPlan,
            freeLimit: FREE_ACCOUNT_LIMIT,
        });
    } catch (err) {
        console.error("Error in /api/user_services:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
