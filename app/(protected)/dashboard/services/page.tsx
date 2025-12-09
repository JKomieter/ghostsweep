"use client"
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ServiceTable from "../_components/services/service-table";
import ServiceTitle from "../_components/services/service-title";
import { useMemo, useState } from "react";
import { Category, UserService } from "@/types";
import { BreachRecord } from "../_components/breaches-table";
import ServicesMetrics from "../_components/services/services-metrics";
import { isForgottenService } from "@/utils/is-forgotten-service";
import { createClient } from "@/utils/supabase/client";


export default function ServicePage() {
    const supabase =  createClient();
    const [query, setQuery] = useState("")
        const [category, setCategory] = useState<Category | undefined>(undefined)
        const [breachedFilter, setBreachedFilter] = useState<
            "all" | "breached" | "unbreached"
        >("all")
    const [page, setPage] = useState(1)

    const { data: userService, status: userServiceStatus } = useQuery({
        queryKey: ["user-services", query, page, category, breachedFilter],
        queryFn: async (): Promise<{ services: UserService[]; total: number }> => {
            const params = new URLSearchParams()
            params.set("page", String(page))
            if (query) params.set("query", query)
            if (category) params.set("category", category === "All" ? "" : category)
            if (breachedFilter) params.set("breached", breachedFilter === "all" ? "" : breachedFilter)

            const res = await fetch(`/api/user-services?${params.toString()}`)
            if (!res.ok) {
                throw new Error("Network response was not ok")
            }
            return res.json()
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    })

    const { data: breaches, status: breachesStatus } = useQuery({
        queryKey: ['breaches'],
        queryFn: async (): Promise<{ breaches: BreachRecord[], total: number }> => {
            const res = await fetch('/api/user-breaches')
            if (!res.ok) {
                throw new Error('Network response was not ok')
            }
            const { breaches, total } = await res.json()
            return { breaches, total }
        },
    })

    const { data: deletionRequests, status: deletionRequestStatus } = useQuery({
            queryKey: ["deletion-requests-count"],
            queryFn: async () => {
                const {count} = await supabase.from("deletion_requests")
                .select("id", {count: "exact", head: true})

                return count ?? 0
            },
        });

    const accountsFound = userService?.total ?? 0;
    const breached = breaches?.total ?? 0

    const forgotten = useMemo(() => {
        let count = 0;
        if (!userService) return count
        for (const svc of userService.services) {
            const svcIsForgotten = isForgottenService({
                last_seen_at: svc.last_seen_at,
                first_seen_at: svc.first_seen_at,
                email_count: svc.email_count
            }).isForgotten
            if (svcIsForgotten) {
                count += 1
            }
        }

        return count
    }, [userService])

    const isLoading = userServiceStatus === "pending" || breachesStatus === "pending" || deletionRequestStatus === "pending"

    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-8 md:py-8 space-y-6">
            <ServiceTitle />
            <ServicesMetrics accountsFound={accountsFound} forgotten={forgotten} breached={breached} deletions={deletionRequests ?? 0} isLoading={isLoading}
            />
            <ServiceTable userService={userService} userServiceStatus={userServiceStatus} query={query} setQuery={setQuery}
             category={category} setCategory={setCategory}
             page={page} setPage={setPage} breachedFilter={breachedFilter} setBreachedFilter={setBreachedFilter} breaches={breaches}
            />
        </div>
    );
}