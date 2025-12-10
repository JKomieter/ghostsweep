"use client";

import { SetStateAction, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";


import { Category, DeletionStatus } from "@/types";
import DeletionRequestTitle from "../_components/deletion-requests/deletion-requests-title";
import DeletionRequestsTable from "../_components/deletion-requests/deletion-requests-table";
import DeletionRequestDetail from "../_components/deletion-requests/deletion-request-details";
import DeletionRequestsMetrics from "../_components/deletion-requests/deletion-request-metrics";


export type DeletionRequest = {
    id: string;
    user_id: string;
    service_id: string;
    status: DeletionStatus;
    to_address: string | null;
    subject: string | null;
    sent_at: string | null;
    last_checked_at: string | null;
    last_reply_at: string | null;
    reply_message_id: string | null;
    reply_snippet: string | null;
    last_notified_status: DeletionStatus | null;
    last_notified_at: string | null;
    user_service: {
        id: string | null;
        service: {
            id: string;
            name: string | null;
            domain: string | null;
            category: Category | null;
            contact: string | null;
            is_breached: boolean | null;
        } | null
    } | null;
};

type DeletionRequestsQueryResult = {
    requests: DeletionRequest[];
    total: number;
    page: number;
    pageSize: number;
};

const PAGE_SIZE = 20;


export default function PrivacyRequestsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("open");
    const [selected, setSelected] = useState<DeletionRequest | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data, status } = useQuery<DeletionRequestsQueryResult>({
        queryKey: ["deletion-requests", page, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("pageSize", String(PAGE_SIZE));
            if (statusFilter && statusFilter !== "all") {
                params.set("status", statusFilter);
            }

            const res = await fetch(`/api/deletion-requests?${params.toString()}`);
            if (!res.ok) {
                throw new Error("Failed to fetch privacy requests");
            }
            return res.json();
        },
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const isLoading = status === "pending";
    const requests = data?.requests ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const canPrev = page > 1;
    const canNext = page < totalPages;

    const requestStats = useMemo(() => {
        const stats = {
            open: 0,
            completed: 0,
            failedOrExpired: 0,
        };

        if (!data || !data?.requests) return stats;

        for (const request of data.requests) {
            switch (request.status) {
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

                default:
                    break;
            }
        }

        return stats;
    }, [data]);

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)] space-y-6">
            <DeletionRequestTitle />

            <DeletionRequestsMetrics isLoading={isLoading} total={total} open={requestStats.open} completed={requestStats.completed} failedOrExpired={requestStats.failedOrExpired}
            />

            <DeletionRequestsTable
                requests={requests} isLoading={isLoading}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                setSelected={setSelected} setSheetOpen={setSheetOpen}
                page={0} setPage={setPage} canPrev={canPrev} canNext={canNext} total={total} totalPages={totalPages}
            />

            <DeletionRequestDetail sheetOpen={sheetOpen} setSheetOpen={setSheetOpen} selected={selected} />
        </div>
    );
}