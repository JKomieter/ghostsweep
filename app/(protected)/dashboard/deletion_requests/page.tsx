"use client";

import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import DeletionRequestTitle from "../_components/deletion_requests/deletion_requests_title";
import DeletionRequestsTable from "../_components/deletion_requests/deletion_requests_table";
import DeletionRequestDetail from "../_components/deletion_requests/deletion_request_details";
import DeletionRequestsMetrics from "../_components/deletion_requests/deletion_request_metrics";

import type { DeletionRequestsQueryResult, DeletionRequestListRow } from "@/queryTypes";

const PAGE_SIZE = 20;

type StatusFilter = "open" | "all" | "sent" | "received" | "needs_verification" | "in_progress" | "completed" | "failed" | "expired" | "drafted";

export default function PrivacyRequestsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");

    const [selected, setSelected] = useState<DeletionRequestListRow | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data, status } = useQuery<DeletionRequestsQueryResult>({
        queryKey: ["deletion_requests", page, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("pageSize", String(PAGE_SIZE));

            // only send status if it's meaningful
            if (statusFilter && statusFilter !== "all") {
                params.set("status", statusFilter);
            }

            const res = await fetch(`/api/deletion_requests?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch deletion requests");
            return res.json();
        },
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const isLoading = status === "pending";

    const requests = useMemo(() => {
        const requests = data?.requests ?? [];
        return requests
    }, [data])
    
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const canPrev = page > 1;
    const canNext = page < totalPages;

    // Important: these stats are only accurate *for the current page*.
    // If you want global stats, add a /metrics endpoint later.
    const requestStats = useMemo(() => {
        const stats = { open: 0, completed: 0, failedOrExpired: 0 };

        for (const r of requests) {
            switch (r.status) {
                case "sent":
                case "received":
                case "needs_verification":
                case "in_progress":
                    stats.open++;
                    break;
                case "completed":
                    stats.completed++;
                    break;
                case "failed":
                case "expired":
                    stats.failedOrExpired++;
                    break;
            }
        }
        return stats;
    }, [requests]);

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)] space-y-6">
            <DeletionRequestTitle />

            <DeletionRequestsMetrics
                isLoading={isLoading}
                total={total}
                open={requestStats.open}
                completed={requestStats.completed}
                failedOrExpired={requestStats.failedOrExpired}
            />

            <DeletionRequestsTable
                requests={requests}
                isLoading={isLoading}
                statusFilter={statusFilter}
                setStatusFilter={(v) => {
                    setStatusFilter(v as StatusFilter);
                    setPage(1); // reset pagination when filter changes
                }}
                setSelected={setSelected}
                setSheetOpen={setSheetOpen}
                page={page}
                setPage={setPage}
                canPrev={canPrev}
                canNext={canNext}
                total={total}
                totalPages={totalPages}
            />

            <DeletionRequestDetail
                sheetOpen={sheetOpen}
                setSheetOpen={setSheetOpen}
                selected={selected}
            />
        </div>
    );
}