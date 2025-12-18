import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 50;

// MVP filters (Pro list only):
// - status: comma-separated (sent,received,in_progress,completed,failed,expired,needs_verification,drafted)
// - started: "true" | "false"  (has deletion request row or not)
// - confidence: "high" | "medium" | "low"   (uses user_services.confidence_score if present, else services.confidence_score)
// - email_count: "0-1" | "2-10" | "10+"
// - age: "30d" | "3-6m" | "6-12m" | "1y+"   (uses user_services.first_seen_at)
// Existing:
// - query, category, breached, page

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

        // ✅ Get user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Get plan
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

        // ✅ Query params
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        const searchQuery = searchParams.get("query")?.trim() ?? "";
        const category = searchParams.get("category")?.trim() ?? "";
        const breachedParam = searchParams.get("breached")?.trim() ?? "";
        const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

        // NEW
        const statusParam = searchParams.get("status"); // comma-separated
        const startedParam = searchParams.get("started"); // true/false
        const confidenceParam = searchParams.get("confidence")?.trim() ?? ""; // high/medium/low
        const emailCountParam = searchParams.get("email_count")?.trim() ?? ""; // 0-1 | 2-10 | 10+
        const ageParam = searchParams.get("age")?.trim() ?? ""; // 30d | 3-6m | 6-12m | 1y+

        // 🔍 breached filter
        let breachedFilter: boolean | null = null;
        if (breachedParam === "breached" || breachedParam === "true" || breachedParam === "1") {
            breachedFilter = true;
        } else if (breachedParam === "unbreached" || breachedParam === "false" || breachedParam === "0") {
            breachedFilter = false;
        }

        // 🔍 status filter (safe)
        const statusList = parseCsv(statusParam).filter((s) => ALLOWED_STATUSES.has(s));

        // 🔍 started filter
        const startedFilter = parseBool(startedParam);

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // ===========================
        // 📊 Count query (always allowed)
        // ===========================
        let countQuery = supabase
            .from("user_services")
            .select(
                `
          id,
          service:services!inner (id),
          deletion_request:deletion_requests!deletion_requests_user_service_id_fkey (id,status)
        `,
                { count: "exact" }
            )
            .eq("user_id", user.id)
            .order("id", { ascending: true })
            .limit(1, { foreignTable: "deletion_requests" });

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

        // started=true => has nested deletion_request
        // started=false => no nested deletion_request
        if (startedFilter === true) {
            countQuery = countQuery.not("deletion_requests.id", "is", null);
        } else if (startedFilter === false) {
            countQuery = countQuery.is("deletion_requests.id", null);
        }

        // status=... => filter nested deletion_request.status
        if (statusList.length > 0) {
            countQuery = countQuery.in("deletion_requests.status", statusList);
        }

        // confidence filter (prefer user_services.confidence_score if you have it)
        if (confidenceParam) {
            if (confidenceParam === "high") countQuery = countQuery.gte("confidence_score", 80);
            if (confidenceParam === "medium") countQuery = countQuery.gte("confidence_score", 50).lt("confidence_score", 80);
            if (confidenceParam === "low") countQuery = countQuery.lt("confidence_score", 50);
        }

        // email_count filter
        if (emailCountParam) {
            if (emailCountParam === "0-1") countQuery = countQuery.lte("email_count", 1);
            if (emailCountParam === "2-10") countQuery = countQuery.gte("email_count", 2).lte("email_count", 10);
            if (emailCountParam === "10+") countQuery = countQuery.gte("email_count", 10);
        }

        // age filter (first_seen_at)
        if (ageParam) {
            const now = new Date();
            const afterIso = (() => {
                const d = new Date(now);
                if (ageParam === "30d") d.setDate(d.getDate() - 30);
                else if (ageParam === "3-6m") d.setMonth(d.getMonth() - 6);
                else if (ageParam === "6-12m") d.setMonth(d.getMonth() - 12);
                else if (ageParam === "1y+") d.setFullYear(d.getFullYear() - 100); // no-op-ish for lower bound
                else return null;
                return d.toISOString();
            })();

            // For "30d": first_seen_at >= now-30d
            if (ageParam === "30d" && afterIso) countQuery = countQuery.gte("first_seen_at", afterIso);

            // For ranges, use between
            if (ageParam === "3-6m") {
                const start = new Date(now); start.setMonth(start.getMonth() - 6);
                const end = new Date(now); end.setMonth(end.getMonth() - 3);
                countQuery = countQuery.gte("first_seen_at", start.toISOString()).lte("first_seen_at", end.toISOString());
            }
            if (ageParam === "6-12m") {
                const start = new Date(now); start.setMonth(start.getMonth() - 12);
                const end = new Date(now); end.setMonth(end.getMonth() - 6);
                countQuery = countQuery.gte("first_seen_at", start.toISOString()).lte("first_seen_at", end.toISOString());
            }
            if (ageParam === "1y+") {
                const end = new Date(now); end.setFullYear(end.getFullYear() - 1);
                countQuery = countQuery.lte("first_seen_at", end.toISOString());
            }
        }

        const { count: serviceCount, error: countError } = await countQuery;

        if (countError) {
            console.error("Error counting user services:", countError);
            return NextResponse.json(
                { error: "Internal Server Error", code: "USER_SERVICES_COUNT_ERROR" },
                { status: 500 }
            );
        }

        // ✅ Free tier: return ONLY the total; hide list
        if (!isPro) {
            return NextResponse.json({
                userServices: [],
                total: serviceCount ?? 0,
                page,
                pageSize: PAGE_SIZE,
                hasMore: typeof serviceCount === "number" ? to + 1 < serviceCount : false,
                gated: true,
                currentPlan,
            });
        }

        // ===========================
        // 📦 Pro tier: return full list
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
          confidence_score,
          service:services!inner (*),
          deletion_request:deletion_requests!deletion_requests_user_service_id_fkey (*)
        `
            )
            .eq("user_id", user.id)
            .order("last_seen_at", { ascending: false })
            .order("sent_at", { referencedTable: "deletion_requests", ascending: false })
            .limit(1, { foreignTable: "deletion_requests" });

        if (searchQuery) {
            query = query.or(
                `name.ilike.%${searchQuery}%,domain.ilike.%${searchQuery}%`,
                { foreignTable: "services" }
            );
        }

        if (category) {
            query = query.eq("services.category", category);
        }

        if (breachedFilter !== null) {
            query = query.eq("services.is_breached", breachedFilter);
        }

        if (startedFilter === true) {
            query = query.not("deletion_requests.id", "is", null);
        } else if (startedFilter === false) {
            query = query.is("deletion_requests.id", null);
        }

        if (statusList.length > 0) {
            query = query.in("deletion_requests.status", statusList);
        }

        if (confidenceParam) {
            if (confidenceParam === "high") query = query.gte("confidence_score", 80);
            if (confidenceParam === "medium") query = query.gte("confidence_score", 50).lt("confidence_score", 80);
            if (confidenceParam === "low") query = query.lt("confidence_score", 50);
        }

        if (emailCountParam) {
            if (emailCountParam === "0-1") query = query.lte("email_count", 1);
            if (emailCountParam === "2-10") query = query.gte("email_count", 2).lte("email_count", 10);
            if (emailCountParam === "10+") query = query.gte("email_count", 10);
        }

        if (ageParam) {
            const now = new Date();

            if (ageParam === "30d") {
                const d = new Date(now);
                d.setDate(d.getDate() - 30);
                query = query.gte("first_seen_at", d.toISOString());
            }

            if (ageParam === "3-6m") {
                const start = new Date(now); start.setMonth(start.getMonth() - 6);
                const end = new Date(now); end.setMonth(end.getMonth() - 3);
                query = query.gte("first_seen_at", start.toISOString()).lte("first_seen_at", end.toISOString());
            }

            if (ageParam === "6-12m") {
                const start = new Date(now); start.setMonth(start.getMonth() - 12);
                const end = new Date(now); end.setMonth(end.getMonth() - 6);
                query = query.gte("first_seen_at", start.toISOString()).lte("first_seen_at", end.toISOString());
            }

            if (ageParam === "1y+") {
                const end = new Date(now); end.setFullYear(end.getFullYear() - 1);
                query = query.lte("first_seen_at", end.toISOString());
            }
        }

        query = query.range(from, to);

        const { data: userServices, error } = await query;

        if (error) {
            console.error("Error fetching user services:", error);
            return NextResponse.json(
                { error: "Internal Server Error", code: "USER_SERVICES_NOT_FOUND" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            userServices: userServices ?? [],
            total: serviceCount ?? 0,
            page,
            pageSize: PAGE_SIZE,
            hasMore: typeof serviceCount === "number" ? to + 1 < serviceCount : false,
            gated: false,
            currentPlan,
        });
    } catch (err) {
        console.error("Error in /api/user_services:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}