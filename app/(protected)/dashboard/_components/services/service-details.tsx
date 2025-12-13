"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, ExternalLink, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Category } from "@/types";
import { DeletionProfileModal } from "./deletion-profile-modal";
import DeletionEmailModal from "./deletion-request-modal";
import BreachesTab from "./service-tabs/breaches-tab";
import { DeletionRequest, DeletionTab } from "./service-tabs/deletion-tab";
import SummaryTab from "./service-tabs/summary-tab";

/** Keep same helper as your sheet */
const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

type DeletionProfileQueryResult = {
    full_name: string | null;
    country: string | null;
};

export interface UserServiceQueryResult {
    id: string;
    user_id: string;
    service_id: string;
    first_seen_at: string | null;
    last_seen_at: string | null;
    email_count: number;
    service: {
        id: string;
        name: string | null;
        domain: string | null;
        contact: string | null;
        category: Category | null;
        is_breached: boolean | null;
        logo_url?: string | null;
    };
    breaches: {
        id: string;
        breach_id: string;
        email: string | null;
        domain: string | null;
        breach_date: string | null;
        data_classes: string[] | null;
        is_sensitive: boolean | null;
        description: string | null;
        raw: { [key: string]: unknown } | null;
    }[];
    deletionRequest: DeletionRequest | null;
}

type Props = {
    userServiceId: string;
};

export default function ServiceDetailsPage({ userServiceId }: Props) {
    const queryClient = useQueryClient();

    const [isDeletionEmailModalOpen, setIsDeletionEmailModalOpen] = useState(false);
    const [isDeletionProfileModalOpen, setIsDeletionProfileModalOpen] = useState(false);

    // Plan
    const { data: plan } = useQuery({
        queryKey: ["plan"],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch("/api/plan", { method: "GET" });
            if (!res.ok) throw new Error("Failed to fetch plan data");
            return res.json();
        },
    });

    // Gmail account
    const { data: gmailAccount } = useQuery({
        queryKey: ["gmailAccount"],
        queryFn: async (): Promise<{ gmail_address: string | null }> => {
            const res = await fetch("/api/gmail_account");
            if (!res.ok) throw new Error("Failed to fetch Gmail account");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    // Deletion profile
    const { data: deletionProfile } = useQuery({
        queryKey: ["deletion-profile"],
        queryFn: async (): Promise<DeletionProfileQueryResult> => {
            const res = await fetch("/api/get-deletion-profile");
            if (!res.ok) throw new Error("Failed to fetch deletion profile");
            return res.json();
        },
    });

    // Service details
    const {
        data: userService,
        status,
        error,
    } = useQuery({
        queryKey: ["userServiceDetails", userServiceId],
        queryFn: async (): Promise<UserServiceQueryResult> => {
            const res = await fetch(`/api/user-services/${userServiceId}`);
            if (!res.ok) throw new Error("Failed to fetch service details");
            const data = await res.json();
            // You were returning data?.service before; keep consistent with your API.
            // If your API returns { service: ... }:
            return data?.service ?? data;
        },
        enabled: !!userServiceId,
    });

    const serviceName = userService?.service?.name || "Unknown service";
    const domain = userService?.service?.domain || "";
    const category = userService?.service?.category || "Unknown";
    const breached = userService?.service?.is_breached === true;

    const websiteUrl = domain ? `https://${domain}` : null;

    const firstSeen = useMemo(
        () => (userService?.first_seen_at ? formatDate(userService.first_seen_at) : "Unknown"),
        [userService],
    );
    const lastSeen = useMemo(
        () => (userService?.last_seen_at ? formatDate(userService.last_seen_at) : "Unknown"),
        [userService],
    );

    // Simple placeholder score (replace with your real computed field later)
    const deletionReadinessScore = useMemo(() => {
        // example heuristic:
        // +40 if contact exists, +20 if website exists, +20 if breached false, +20 if emailCount>0
        let score = 0;
        if (userService?.service?.contact) score += 40;
        if (websiteUrl) score += 20;
        if (!breached) score += 20;
        if ((userService?.email_count ?? 0) > 0) score += 20;
        return Math.min(100, score);
    }, [userService?.service?.contact, websiteUrl, breached, userService?.email_count]);

    const openDeletionModal = () => {
        if (plan?.current_plan !== "pro") {
            toast(() => (
                <div>
                    <span className="font-medium">GhostSweep Professional required</span>
                    <p className="text-sm text-muted-foreground">
                        Unlock privacy request templates and direct contacts.
                    </p>
                    <Link href="/dashboard/billing?plan=monthly">
                        <Button variant="outline" size="sm" className="mt-2">
                            Upgrade to Pro
                        </Button>
                    </Link>
                </div>
            ));
            return;
        }

        if (!deletionProfile?.full_name || !deletionProfile?.country) {
            setIsDeletionProfileModalOpen(true);
            return;
        }

        setIsDeletionEmailModalOpen(true);
    };

    const copyDomain = async () => {
        if (!domain) return;
        try {
            await navigator.clipboard.writeText(domain);
            toast.success("Copied", { description: domain });
        } catch {
            toast.error("Failed to copy");
        }
    };

    const refetchEverything = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["userServiceDetails", userServiceId] }),
            queryClient.invalidateQueries({ queryKey: ["services"] }),
            queryClient.invalidateQueries({ queryKey: ["breaches"] }),
        ]);
        toast.success("Refreshed");
    };

    return (
        <div className="w-full">
            {/* Top bar (mobile-friendly) */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                {/* Left: back + title/meta */}
                <div className="flex items-start gap-3">
                    <Link href="/dashboard/services" className="shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 px-2 md:px-3"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                    </Link>

                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="min-w-0 truncate text-lg font-semibold text-white md:text-xl">
                                {serviceName}
                            </h1>

                            {domain && (
                                <span className="max-w-[70vw] truncate rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-white/70 sm:max-w-[360px]">
                                    {domain}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                                {category}
                            </Badge>

                            {breached ? (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                    <ShieldAlert className="mr-1 h-3 w-3" />
                                    Breached
                                </Badge>
                            ) : (
                                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs">
                                    No known breach
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetchEverything}
                        className="w-full md:w-auto"
                    >
                        Refresh
                    </Button>

                    <Button
                        size="sm"
                        onClick={openDeletionModal}
                        className="w-full md:w-auto md:min-w-[170px]"
                    >
                        Generate deletion request
                    </Button>
                </div>
            </div>

            {/* Loading / Error */}
            {status === "pending" ? (
                <div className="flex min-h-[300px] w-full items-center justify-center">
                    <Spinner className="text-primary size-8" />
                </div>
            ) : status === "error" ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <h2 className="text-base font-semibold text-white">Error loading service</h2>
                    <p className="mt-1 text-sm text-white/60">
                        {(error as Error)?.message || "Something went wrong."}
                    </p>
                    <div className="mt-4">
                        <Button variant="outline" size="sm" onClick={refetchEverything}>
                            Try again
                        </Button>
                    </div>
                </div>
            ) : !userService ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                    <h2 className="text-base font-semibold text-white">Service not found</h2>
                    <p className="mt-1 text-sm text-white/60">This record may have been deleted.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Main content */}
                    <div className="lg:col-span-8">
                        <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                            <Tabs defaultValue="summary" className="w-full">
                                <TabsList className="w-full justify-start bg-transparent border-b border-white/10 rounded-none px-0">
                                    <TabsTrigger
                                        value="summary"
                                        className="data-[state=active]:border-b data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-3 pb-2 text-sm"
                                    >
                                        Summary
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="breaches"
                                        className="data-[state=active]:border-b data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-3 pb-2 text-sm"
                                    >
                                        Breaches
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="deletion_requests"
                                        className="data-[state=active]:border-b data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-3 pb-2 text-sm"
                                    >
                                        Deletion
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="summary" className="pt-4">
                                    <SummaryTab
                                        lastSeen={lastSeen}
                                        firstSeen={firstSeen}
                                        emailCount={userService.email_count ?? 0}
                                        breached={breached}
                                        websiteUrl={websiteUrl}
                                        contact={userService?.service.contact}
                                        current_plan={plan?.current_plan}
                                    />
                                </TabsContent>

                                <TabsContent value="breaches" className="pt-4">
                                    <BreachesTab breaches={userService.breaches} />
                                </TabsContent>

                                <TabsContent value="deletion_requests" className="pt-4">
                                    <DeletionTab
                                        serviceName={userService.service.name}
                                        request={userService.deletionRequest}
                                        openModal={openDeletionModal}
                                        setIsDeletionProfileModalOpen={setIsDeletionProfileModalOpen}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right rail */}
                    <div className="lg:col-span-4">
                        <div className="space-y-4">
                            {/* Quick info */}
                            <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white">Quick info</h3>
                                    {/* {status === "pending" && <Loader2 className="h-4 w-4 animate-spin text-white/70" />} */}
                                </div>

                                <div className="mt-3 space-y-3 text-sm">
                                    <div className="flex items-center justify-between text-white/80">
                                        <span className="text-white/60">First seen</span>
                                        <span>{firstSeen}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-white/80">
                                        <span className="text-white/60">Last seen</span>
                                        <span>{lastSeen}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-white/80">
                                        <span className="text-white/60">Emails</span>
                                        <span>{(userService.email_count ?? 0).toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-white/80">
                                        <span className="text-white/60">Contact</span>
                                        <span className="truncate max-w-[180px]">
                                            {userService.service.contact ? userService.service.contact : "—"}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {websiteUrl && (
                                            <a href={websiteUrl} target="_blank" rel="noreferrer">
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    Visit website <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        )}
                                        {domain && (
                                            <Button variant="outline" size="sm" className="gap-2" onClick={copyDomain}>
                                                Copy domain <Copy className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Deletion readiness */}
                            <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                                <h3 className="text-sm font-semibold text-white">Deletion readiness</h3>
                                <p className="mt-1 text-xs text-white/60">
                                    How ready we are to generate a high-quality privacy request.
                                </p>

                                <div className="mt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/60">Score</span>
                                        <span className="text-xs font-semibold text-white">{deletionReadinessScore}/100</span>
                                    </div>

                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full bg-cyan-400 transition-all duration-300"
                                            style={{ width: `${deletionReadinessScore}%` }}
                                        />
                                    </div>

                                    <div className="mt-3 space-y-2 text-xs text-white/70">
                                        {!userService.service.contact && (
                                            <p>• Missing contact email (improves success rate).</p>
                                        )}
                                        {!websiteUrl && <p>• Missing website link.</p>}
                                        {breached && <p>• Known breach flagged (prioritize cleanup).</p>}
                                    </div>

                                    <div className="mt-4">
                                        <Button size="sm" onClick={openDeletionModal} className="w-full">
                                            Use deletion template
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modals */}
                    <DeletionEmailModal
                        open={isDeletionEmailModalOpen}
                        onOpenChangeAction={setIsDeletionEmailModalOpen}
                        userService={userService}
                        gmailAddress={gmailAccount?.gmail_address || ""}
                    />

                    <DeletionProfileModal
                        open={isDeletionProfileModalOpen}
                        onOpenChangeAction={setIsDeletionProfileModalOpen}
                        initialCountry={deletionProfile?.country}
                        initialFullName={deletionProfile?.full_name}
                        setIsDeletionEmailModalOpen={setIsDeletionEmailModalOpen}
                    />
                </div>
            )}
        </div>
    );
}