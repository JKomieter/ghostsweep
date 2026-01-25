"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ServiceTable from "../_components/user_services/service_table";
import ServicePageTitle from "../_components/user_services/service_page_title";
import {  useState, Suspense } from "react";
import { Category } from "@/types";
import ServicesMetrics from "../_components/user_services/services_metrics";
import { DeletionRequestsQueryResult, UserBreachesQueryResult, UserServicesQueryResult } from "@/queryTypes";


type BreachFilter = "all" | "breached" | "unbreached";
type ActivityFilter = "all" | "active" | "inactive";
type HasDeletionFilter = "all" | "yes" | "no";
type EmailFilter = "all" | string; // "all" or specific email address

// 🔥 Extract component that uses useSearchParams
function ServicesPageContent() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<Category | undefined | "all">("all");
    const [breachedFilter, setBreachedFilter] = useState<BreachFilter>("all");
    const [page, setPage] = useState(1);
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
    const [minEmails, setMinEmails] = useState<number | undefined>(undefined);
    const [hasDeletionRequest, setHasDeletionRequest] = useState<HasDeletionFilter>("all");
    const [emailFilter, setEmailFilter] = useState<EmailFilter>("all");

    // Fetch Gmail and Microsoft accounts for email filtering
    const { data: emailAccountsData } = useQuery({
        queryKey: ["emailAccounts"],
        queryFn: async (): Promise<{
            gmailAccounts: Array<{ id: string; gmail_address: string; created_at: string }>;
            microsoftAccounts: Array<{ id: string; outlook_address: string; created_at: string }>;
        }> => {
            const [gmailRes, microsoftRes] = await Promise.all([
                fetch("/api/gmail_account"),
                fetch("/api/microsoft_account"),
            ]);

            const gmail = gmailRes.ok ? await gmailRes.json() : { accounts: [] };
            const microsoft = microsoftRes.ok ? await microsoftRes.json() : { accounts: [] };

            return {
                gmailAccounts: gmail.accounts || [],
                microsoftAccounts: microsoft.accounts || [],
            };
        },
        refetchOnWindowFocus: false,
    });

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
            emailFilter,
        ],
        queryFn: async (): Promise<UserServicesQueryResult> => {
            const params = new URLSearchParams();
            params.set("page", String(page));

            if (query) params.set("query", query);

            if (category && category !== "all") {
                params.set("category", category);
            }

            if (breachedFilter !== "all") {
                params.set("breached", breachedFilter);
            }

            if (activityFilter !== "all") {
                params.set("activity", activityFilter);
            }

            if (typeof minEmails === "number") {
                params.set("min_emails", String(minEmails));
            }

            if (hasDeletionRequest !== "all") {
                params.set("has_deletion_request", hasDeletionRequest);
            }

            if (emailFilter !== "all") {
                params.set("email", emailFilter);
            }

            const res = await fetch(`/api/user_services?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch user services");
            return res.json();
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });

    const { data: userBreachesQueryResult, status: userBreachesQueryResultStatus } = useQuery({
        queryKey: ["user_breaches"],
        queryFn: async (): Promise<UserBreachesQueryResult> => {
            const res = await fetch("/api/user_breaches");
            if (!res.ok) throw new Error("Failed to fetch user breaches");
            return res.json();
        },
    });

    const { data: deletionRequestsQueryResult, status: deletionRequestsQueryResultStatus } = useQuery({
        queryKey: ["deletion_requests"],
        queryFn: async (): Promise<DeletionRequestsQueryResult> => {
            const res = await fetch("/api/deletion_requests");
            if (!res.ok) throw new Error("Failed to fetch deletion requests");
            return res.json();
        },
    });

    // Fetch forgotten count separately (without pagination) for consistent total
    const { data: forgottenCountResult } = useQuery({
        queryKey: [
            "forgotten_count",
            query,
            category ?? "",
            breachedFilter,
            activityFilter,
            minEmails ?? "",
            hasDeletionRequest,
            emailFilter,
        ],
        queryFn: async (): Promise<{ forgotten: number }> => {
            const params = new URLSearchParams();

            if (query) params.set("query", query);

            if (category && category !== "all") {
                params.set("category", category);
            }

            if (breachedFilter !== "all") {
                params.set("breached", breachedFilter);
            }

            if (activityFilter !== "all") {
                params.set("activity", activityFilter);
            }

            if (typeof minEmails === "number") {
                params.set("min_emails", String(minEmails));
            }

            if (hasDeletionRequest !== "all") {
                params.set("has_deletion_request", hasDeletionRequest);
            }

            if (emailFilter !== "all") {
                params.set("email", emailFilter);
            }

            const res = await fetch(`/api/user_services/forgotten_count?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch forgotten count");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const accountsFound = userServicesQueryResult?.total ?? 0;
    const breached = userBreachesQueryResult?.total ?? 0;
    const forgotten = forgottenCountResult?.forgotten ?? 0;

    const isLoading =
        userServicesQueryResultStatus === "pending" ||
        userBreachesQueryResultStatus === "pending" ||
        deletionRequestsQueryResultStatus === "pending";

    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-8 md:py-8">
            <div className="max-w-6xl mx-auto space-y-8">
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
                    activityFilter={activityFilter}
                    setActivityFilter={setActivityFilter}
                    minEmails={minEmails}
                    setMinEmails={setMinEmails}
                    hasDeletionRequest={hasDeletionRequest}
                    setHasDeletionRequest={setHasDeletionRequest}
                    emailFilter={emailFilter}
                    setEmailFilter={setEmailFilter}
                    gmailAccounts={emailAccountsData?.gmailAccounts || []}
                    microsoftAccounts={emailAccountsData?.microsoftAccounts || []}
                />
            </div>
        </div>
    );
}

// 🔥 Wrap in Suspense boundary
export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-8 md:py-8 space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        }>
            <ServicesPageContent />
        </Suspense>
    );
}