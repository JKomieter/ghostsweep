"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AccountsTable from "../_components/accounts/accounts_table";
import AccountsPageTitle from "../_components/accounts/accounts_page_title";
import AccountsMetrics from "../_components/accounts/accounts_metrics";
import PrivacyScoreCard from "../_components/accounts/privacy_score_card";
import DeletionRequestsTable from "../_components/user_services/service_tabs/deletion_requests_table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatusFilter = "all" | "breached" | "unused" | "deleted";
type SortOption = "risk" | "alphabetical" | "oldest";

// Extract component that uses useSearchParams
function AccountsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize state from URL params
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "accounts");
    const [status, setStatus] = useState<StatusFilter>(
        (searchParams.get("status") as StatusFilter) || "all"
    );
    const [sort, setSort] = useState<SortOption>(
        (searchParams.get("sort") as SortOption) || "risk"
    );
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [emailFilter, setEmailFilter] = useState(searchParams.get("email") || "all");
    const [whitelistedFilter, setWhitelistedFilter] = useState(searchParams.get("whitelisted") || "");

    // Sync filter changes to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (activeTab !== "accounts") params.set("tab", activeTab);
        if (status !== "all") params.set("status", status);
        if (sort !== "risk") params.set("sort", sort);
        if (search) params.set("search", search);
        if (emailFilter !== "all") params.set("email", emailFilter);
        if (whitelistedFilter) params.set("whitelisted", whitelistedFilter);
        
        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/dashboard/accounts${newUrl}`, { scroll: false });
    }, [activeTab, status, sort, search, emailFilter, whitelistedFilter, router]);

    // Fetch accounts data
    const { data: accountsResult, status: accountsStatus } = useQuery({
        queryKey: ["accounts", status, sort, search, emailFilter, whitelistedFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (status !== "all") params.set("status", status);
            if (sort !== "risk") params.set("sort", sort);
            if (search) params.set("search", search);
            if (emailFilter !== "all") params.set("email", emailFilter);
            if (whitelistedFilter) params.set("whitelisted", whitelistedFilter);

            const res = await fetch(`/api/dashboard/accounts?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch accounts");
            return res.json();
        },
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    });

    // Fetch deletion requests data for second tab
    const { data: deletionRequestsResult, status: deletionRequestsStatus } = useQuery({
        queryKey: ["deletion_requests"],
        queryFn: async () => {
            const res = await fetch("/api/deletion_requests");
            if (!res.ok) throw new Error("Failed to fetch deletion requests");
            return res.json();
        },
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
        enabled: activeTab === "deletions",
    });
    
    const isLoading = accountsStatus === "pending" || deletionRequestsStatus === "pending";

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-6xl mx-auto space-y-8">
                <AccountsPageTitle />
                
                {/* Privacy Score and Metrics */}
                {accountsResult && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                            <PrivacyScoreCard 
                                privacyScore={accountsResult.privacyScore}
                            />
                            <div className="lg:col-span-4">
                                <AccountsMetrics
                                    totalCount={accountsResult.totalCount}
                                    breachedCount={accountsResult.breachedCount}
                                    unusedCount={accountsResult.unusedCount}
                                    deletedCount={accountsResult.deletedCount}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-transparent border-b border-white/5">
                        <TabsTrigger 
                            value="accounts" 
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white text-white/60 rounded-none"
                        >
                            Accounts
                        </TabsTrigger>
                        <TabsTrigger 
                            value="deletions" 
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white text-white/60 rounded-none"
                        >
                            Deletions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="accounts" className="space-y-6">
                        {accountsResult && (
                            <AccountsTable
                                accountsResult={accountsResult}
                                accountsStatus={accountsStatus}
                                status={status}
                                setStatus={setStatus}
                                sort={sort}
                                setSort={setSort}
                                search={search}
                                setSearch={setSearch}
                                emailFilter={emailFilter}
                                setEmailFilter={setEmailFilter}
                                whitelistedFilter={whitelistedFilter}
                                setWhitelistedFilter={setWhitelistedFilter}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="deletions" className="space-y-6">
                        {deletionRequestsResult && (
                            <DeletionRequestsTable
                                deletionRequestsResult={deletionRequestsResult}
                                deletionRequestsStatus={deletionRequestsStatus}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Main component with Suspense wrapper
export default function AccountsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen p-8 text-white/60">Loading...</div>}>
            <AccountsPageContent />
        </Suspense>
    );
}
