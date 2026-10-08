"use client";

import React from "react";
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/utils/format_date";

interface DeletionRequest {
    id: string;
    status: string;
    sent_at: string | null;
    updated_at: string;
    user_service: {
        id: string;
        service: {
            id: string;
            name: string;
            domain: string;
            category: string | null;
            logo_url: string | null;
            is_breached: boolean | null;
        };
    } | null;
}

interface DeletionRequestsTableProps {
    deletionRequestsResult: {
        requests: DeletionRequest[];
        total: number;
    };
    deletionRequestsStatus: "pending" | "error" | "success";
}

export default function DeletionRequestsTable({
    deletionRequestsResult,
    deletionRequestsStatus,
}: DeletionRequestsTableProps) {
    const isLoading = deletionRequestsStatus === "pending";
    const requests = deletionRequestsResult?.requests || [];

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            drafted: { label: "Drafted", className: "bg-foreground/10 text-foreground/75 border-foreground/20" },
            sent: { label: "Sent", className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" },
            received: { label: "Reply Received", className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20" },
            needs_verification: { label: "Needs Verification", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20" },
            in_progress: { label: "In Progress", className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20" },
            completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" },
            failed: { label: "Failed", className: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20" },
            expired: { label: "Expired", className: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20" },
        };

        const statusInfo = statusMap[status] || statusMap.drafted;

        return (
            <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-foreground/10 bg-background/20 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-foreground/10 hover:bg-foreground/5">
                            <TableHead className="text-foreground/60">Service</TableHead>
                            <TableHead className="text-foreground/60">Status</TableHead>
                            <TableHead className="text-foreground/60">Sent Date</TableHead>
                            <TableHead className="text-foreground/60">Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Spinner className="h-6 w-6 text-foreground/40 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((request) => (
                                <TableRow
                                    key={request.id}
                                    className="border-foreground/10 hover:bg-foreground/2"
                                >
                                    <TableCell className="font-medium text-foreground">
                                        <div className="flex items-center gap-2">
                                            {request.user_service?.service?.logo_url && (
                                                <Image 
                                                    src={request.user_service.service.logo_url} 
                                                    alt="" 
                                                    width={20}
                                                    height={20}
                                                    className="h-5 w-5 rounded"
                                                    unoptimized
                                                />
                                            )}
                                            <span>{request.user_service?.service?.name || "Unknown Service"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(request.status)}
                                    </TableCell>
                                    <TableCell className="text-foreground/80">
                                        {request.sent_at ? formatDate(request.sent_at) : "Not sent"}
                                    </TableCell>
                                    <TableCell className="text-foreground/60">
                                        {formatDate(request.updated_at)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-foreground/40">
                                    No deletion requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}