"use client";

import * as React from "react";
import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useQuery } from "@tanstack/react-query";
import { BulkUserServicesQueryResult } from "@/queryTypes";
import EmailBulkTab from "../_components/bulk_deletion/email_bulk_tab";
import LinkBulkTab from "../_components/bulk_deletion/link_bulk_tab";
import ManualBulkTab from "../_components/bulk_deletion/manual_bulk_tab";

/**
 * URL formats supported:
 * 1) ?ids=id1,id2,id3
 * 2) ?ids=id1&ids=id2&ids=id3  (repeated)
 *
 * If you’re currently doing something like /bulk-deletions?uids=...
 * just change the param key below from "ids" -> "uids".
 */
function parseIds(searchParams: ReturnType<typeof useSearchParams>, key = "ids") {
    const repeated = searchParams.getAll(key).filter(Boolean);
    if (repeated.length > 0) return repeated;

    const csv = searchParams.get(key);
    if (!csv) return [];
    return csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export default function BulkDeletionsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // 🔧 change "ids" to whatever you used in your URL
    const userServiceIds = useMemo(() => parseIds(searchParams, "ids"), [searchParams]);

    const { data, error, status } = useQuery({
        queryKey: ["bulk_user_services", ...userServiceIds],
        queryFn: async (): Promise<BulkUserServicesQueryResult> => {
            const res = await fetch(`/api/bulk_user_services?ids=${userServiceIds.join(",")}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error)
            return data
        }
    })

    const hasSelection = userServiceIds.length > 0;

    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-8 md:py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold text-white">Bulk deletion</h1>
                    <p className="text-xs text-muted-foreground">
                        Group selected services into email, link, and manual flows. Start with Email first.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
                        Selected: {userServiceIds.length}
                    </Badge>

                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/15 bg-[#050505]"
                        onClick={() => router.push("/dashboard/user_services")}
                    >
                        Back to services
                    </Button>
                </div>
            </div>

            {/* Empty selection state */}
            {!hasSelection ? (
                <div className="rounded-xl border border-white/10 bg-[#050505] p-5">
                    <p className="text-sm text-white/80">No services selected.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Go to the Services page, select accounts, then click Bulk Deletion.
                    </p>

                    <div className="mt-4">
                        <Button onClick={() => router.push("/dashboard/user_services")}>
                            Go to Services
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 bg-[#050505] p-4 md:p-5">
                    <Tabs defaultValue="email" className="w-full">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <TabsList className="bg-black/40 border border-white/10">
                                <TabsTrigger value="email">Email</TabsTrigger>
                                <TabsTrigger value="link">Link</TabsTrigger>
                                <TabsTrigger value="manual">Manual</TabsTrigger>
                            </TabsList>

                            <p className="text-[11px] text-muted-foreground">
                                Tip: Email is the only flow that actually sends messages. Link/Manual only help you complete deletion.
                            </p>
                        </div>

                        <TabsContent value="email" className="mt-4">
                            <EmailBulkTab email={data?.grouped.email ?? []} emailCount={data?.counts.email ?? 0} />
                        </TabsContent>

                        <TabsContent value="link" className="mt-4">
                            <LinkBulkTab linkServices={data?.grouped.link ?? []} linkCount={data?.counts.link ?? 0} />
                        </TabsContent>

                        <TabsContent value="manual" className="mt-4">
                            <ManualBulkTab manualServices={data?.grouped.manual ?? []} manualCount={data?.counts.manual ?? 0} />
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}