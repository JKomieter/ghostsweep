import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // ✅ Get user from session
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // ✅ Get user subscription (for free vs pro limit)
        const {
            data: subscriptionData,
            error: subscriptionError,
        } = await supabase
            .from("user_subscriptions")
            .select("current_plan")
            .eq("user_id", user.id)
            .single();

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
            console.error("Error fetching user subscription:", subscriptionError);
            return NextResponse.json(
                {
                    error: "Internal Server Error",
                    code: "SUBSCRIPTION_FETCH_ERROR",
                },
                { status: 500 }
            );
        }

        const currentPlan = (subscriptionData?.current_plan ||
            "free") as "free" | "pro";

        // ✅ Read query params
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        const searchQuery = searchParams.get("query")?.trim() ?? "";
        const category = searchParams.get("category")?.trim() ?? "";
        const breachedParam = searchParams.get("breached")?.trim() ?? "";
        const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

        // 🔍 Interpret breached filter
        // e.g. ?breached=breached | unbreached | true | false
        let breachedFilter: boolean | null = null;
        if (
            breachedParam === "breached" ||
            breachedParam === "true" ||
            breachedParam === "1"
        ) {
            breachedFilter = true;
        } else if (
            breachedParam === "unbreached" ||
            breachedParam === "false" ||
            breachedParam === "0"
        ) {
            breachedFilter = false;
        }

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // ===========================
        // 📦 Base query for data
        // ===========================
        let query = supabase
            .from("user_services")
            .select(
                `
                id,
                user_id,
                first_seen_at,
                last_seen_at,
                email_count,
                service:services!inner (
                    id,
                    name,
                    domain,
                    default_privacy_email,
                    category,
                    is_breached,
                    logo_url
                ),
                privacy_request:privacy_requests!privacy_requests_user_service_fk (
                    id,
                    action,
                    status,
                    sent_at,
                    last_reply_at,
                    last_checked_at,
                    last_notified_status,
                    last_notified_at
                )
            `
            )
            .eq("user_id", user.id)
            .order("last_seen_at", { ascending: false })
            // 👇 only 1 nested privacy_request per parent row
            .order("sent_at", {
                referencedTable: "privacy_requests",
                ascending: false,
            })
            .limit(1, {
                foreignTable: "privacy_requests",
            });

        // 🔍 Text search on service name/domain
        if (searchQuery) {
            // Important: when using OR on joined table, we use foreignTable: "services"
            query = query.or(
                `name.ilike.%${searchQuery}%,domain.ilike.%${searchQuery}%`,
                { foreignTable: "services" }
            );
        }

        // 🏷 Filter by category (on services table)
        if (category) {
            query = query.eq("services.category", category);
        }

        // ⚠️ Filter breached vs not breached
        if (breachedFilter !== null) {
            query = query.eq("services.is_breached", breachedFilter);
        }

        // 📄 Pagination
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching user services:", error);
            return NextResponse.json(
                {
                    error: "Internal Server Error",
                    code: "USER_SERVICES_NOT_FOUND",
                },
                { status: 500 }
            );
        }

        // ===========================
        // 📊 Count query (no pagination)
        // ===========================
        let countQuery = supabase
            .from("user_services")
            .select(
                `
                id,
                service:services!inner (
                    id,
                    name,
                    domain,
                    category,
                    is_breached
                )
            `,
                { count: "exact", head: true }
            )
            .eq("user_id", user.id);

        if (searchQuery) {
            countQuery = countQuery.or(
                `name.ilike.%${searchQuery}%,domain.ilike.%${searchQuery}%`,
                { foreignTable: "services" }
            );
        }

        if (category) {
            countQuery = countQuery.eq("services.category", category);
        }

        if (breachedFilter !== null) {
            countQuery = countQuery.eq("services.is_breached", breachedFilter);
        }

        const { count: serviceCount, error: countError } = await countQuery;

        if (countError) {
            console.error("Error counting user services:", countError);
            return NextResponse.json(
                {
                    error: "Internal Server Error",
                    code: "USER_SERVICES_COUNT_ERROR",
                },
                { status: 500 }
            );
        }

        // 🔐 Free vs Pro: limit to 50 total rows for free users
        let services = data || [];

        if (currentPlan !== "pro") {
            services = services.slice(0, 50);
        }

        return NextResponse.json({
            services,
            total: serviceCount ?? 0,
            page,
            pageSize: PAGE_SIZE,
            hasMore:
                typeof serviceCount === "number"
                    ? to + 1 < serviceCount
                    : false,
        });
    } catch (err) {
        console.error("Error in /api/services:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}