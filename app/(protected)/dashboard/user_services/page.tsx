"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ServiceTable from "../_components/user_services/service_table";
import ServicePageTitle from "../_components/user_services/service_page_title";
import { useMemo, useState } from "react";
import { Category } from "@/types";
import ServicesMetrics from "../_components/user_services/services-metrics";
import { isForgottenService } from "@/utils/is_forgotten_service";
import { DeletionRequestsQueryResult, UserBreachesQueryResult, UserServicesQueryResult } from "@/queryTypes";

type BreachFilter = "all" | "breached" | "unbreached";
type ActivityFilter = "all" | "active" | "inactive";
type HasDeletionFilter = "all" | "yes" | "no";

export default function Page() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<Category | undefined | "all">(undefined);
    const [breachedFilter, setBreachedFilter] = useState<BreachFilter>("all");
    const [page, setPage] = useState(1);

    // NEW filters
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
    const [minEmails, setMinEmails] = useState<number | undefined>(undefined);
    const [hasDeletionRequest, setHasDeletionRequest] = useState<HasDeletionFilter>("all");

    const { data: userServicesQueryResult, status: userServicesQueryResultStatus } = useQuery({
        queryKey: [
            "user_services",
            query,
            page,
            category ?? "",
            breachedFilter,
            activityFilter,
            minEmails ?? "",
            hasDeletionRequest,
        ],
        queryFn: async (): Promise<UserServicesQueryResult> => {
            const params = new URLSearchParams();
            params.set("page", String(page));

            if (query) params.set("query", query);

            if (category) {
                params.set("category", category === "all" ? "" : category);
            }

            if (breachedFilter !== "all") {
                params.set("breached", breachedFilter);
            }

            // NEW: activity filter
            if (activityFilter !== "all") {
                params.set("activity", activityFilter); // backend: interpret with last_seen_at window
            }

            // NEW: min emails
            if (typeof minEmails === "number") {
                params.set("min_emails", String(minEmails));
            }

            // NEW: has deletion request
            if (hasDeletionRequest !== "all") {
                params.set("has_deletion_request", hasDeletionRequest); // yes | no
            }

            const res = await fetch(`/api/user_services?${params.toString()}`);
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });

    const { data: userBreachesQueryResult, status: userBreachesQueryResultStatus } = useQuery({
        queryKey: ["user_breaches"],
        queryFn: async (): Promise<UserBreachesQueryResult> => {
            const res = await fetch("/api/user_breaches");
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        },
    });

    const { data: deletionRequestsQueryResult, status: deletionRequestsQueryResultStatus } = useQuery({
        queryKey: ["deletion_requests"],
        queryFn: async (): Promise<DeletionRequestsQueryResult> => {
            const res = await fetch("/api/deletion_requests");
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        },
    });

    const accountsFound = userServicesQueryResult?.total ?? 0;
    const breached = userBreachesQueryResult?.total ?? 0;

    const forgotten = useMemo(() => {
        // NOTE: if you're gating list on free, forgotten will be 0 on free (because userServices = [])
        // You can move forgotten count server-side later if you want it accurate for free users.
        let count = 0;
        if (!userServicesQueryResult?.userServices) return count;

        for (const svc of userServicesQueryResult.userServices || []) {
            const svcIsForgotten = isForgottenService({
                last_seen_at: svc.last_seen_at!,
                first_seen_at: svc.first_seen_at!,
                email_count: svc.email_count!,
            }).isForgotten;

            if (svcIsForgotten) count += 1;
        }

        return count;
    }, [userServicesQueryResult]);

    const isLoading =
        userServicesQueryResultStatus === "pending" ||
        userBreachesQueryResultStatus === "pending" ||
        deletionRequestsQueryResultStatus === "pending";

    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-8 md:py-8 space-y-6">
            <ServicePageTitle />
            <ServicesMetrics
                accountsFound={accountsFound}
                forgotten={forgotten}
                breached={breached}
                deletions={deletionRequestsQueryResult?.total ?? 0}
                isLoading={isLoading}
            />

            <ServiceTable
                userServicesQueryResult={userServicesQueryResult}
                userServicesQueryResultStatus={userServicesQueryResultStatus}
                query={query}
                setQuery={setQuery}
                category={category}
                setCategory={setCategory}
                page={page}
                setPage={setPage}
                breachedFilter={breachedFilter}
                setBreachedFilter={setBreachedFilter}
                // NEW
                activityFilter={activityFilter}
                setActivityFilter={setActivityFilter}
                minEmails={minEmails}
                setMinEmails={setMinEmails}
                hasDeletionRequest={hasDeletionRequest}
                setHasDeletionRequest={setHasDeletionRequest}
            />
        </div>
    );
}