"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DeletionProfileModal } from "./deletion_profile_modal";
import DeletionRequestEmailModal from "./deletion_request_email_modal";

import type {
    ServiceDeletionPlaybookQueryResult,
    UserServiceDetailsQueryResult,
} from "@/queryTypes";

import SummaryTab from "./service_tabs/summary_tab";
import BreachesTab from "./service_tabs/breaches_tab";
import DeletionTab from "./service_tabs/deletion_tab";

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

type Props = {
    userServiceId: string;
};

export default function ServiceDetailsPage({ userServiceId }: Props) {
    const queryClient = useQueryClient();

    const [isDeletionEmailModalOpen, setIsDeletionEmailModalOpen] = useState(false);
    const [isDeletionProfileModalOpen, setIsDeletionProfileModalOpen] = useState(false);

    // Plan
    const { data: planQueryResult } = useQuery({
        queryKey: ["plan"],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch("/api/plan", { method: "GET" });
            if (!res.ok) throw new Error("Failed to fetch plan data");
            return res.json();
        },
    });

    // Gmail account (presence helps you render “tracking enabled” messaging)
    const { data: gmailAccountQueryResult } = useQuery({
        queryKey: ["gmail_account"],
        queryFn: async (): Promise<{ gmail_address: string | null }> => {
            const res = await fetch("/api/gmail_account");
            if (!res.ok) throw new Error("Failed to fetch Gmail account");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    // Deletion profile
    const { data: deletionProfileQueryResult } = useQuery({
        queryKey: ["deletion_profile"],
        queryFn: async (): Promise<DeletionProfileQueryResult> => {
            const res = await fetch("/api/deletion_profile");
            if (!res.ok) throw new Error("Failed to fetch deletion profile");
            return res.json();
        },
    });

    // Service details
    const {
        data: userServiceDetailsQueryResult,
        status: userServiceDetailsQueryResultStatus,
        error,
    } = useQuery({
        queryKey: ["user_service_details", userServiceId],
        queryFn: async (): Promise<UserServiceDetailsQueryResult> => {
            const res = await fetch(`/api/user_services/${userServiceId}`);
            if (!res.ok) throw new Error("Failed to fetch service details");
            return res.json();
        },
        enabled: !!userServiceId,
    });

    const currentPlan = planQueryResult?.current_plan ?? "free";
    const gmailConnected = Boolean(gmailAccountQueryResult?.gmail_address);

    const serviceId = userServiceDetailsQueryResult?.userService?.service?.id;

    // Service deletion playbook (depends on serviceId)
    const { data: serviceDeletionPlaybookQueryResult } = useQuery({
        queryKey: ["service_deletion_playbook", serviceId],
        queryFn: async (): Promise<ServiceDeletionPlaybookQueryResult> => {
            const res = await fetch(`/api/service_deletion_playbook/${serviceId}`);
            if (!res.ok) throw new Error("Failed to fetch deletion playbook");
            return res.json();
        },
        enabled: Boolean(serviceId),
        refetchOnWindowFocus: false,
    });

    const playbook = serviceDeletionPlaybookQueryResult?.playbook ?? null;

    const serviceName =
        userServiceDetailsQueryResult?.userService?.service?.name || "Unknown service";
    const domain = userServiceDetailsQueryResult?.userService?.service?.domain || "";
    const category = userServiceDetailsQueryResult?.userService?.service?.category || "Unknown";
    const breached = userServiceDetailsQueryResult?.userService?.service?.is_breached === true;

    const websiteUrl = domain ? `https://${domain}` : null;

    const firstSeen = useMemo(() => {
        const v = userServiceDetailsQueryResult?.userService?.first_seen_at;
        return v ? formatDate(v) : "Unknown";
    }, [userServiceDetailsQueryResult?.userService?.first_seen_at]);

    const lastSeen = useMemo(() => {
        const v = userServiceDetailsQueryResult?.userService?.last_seen_at;
        return v ? formatDate(v) : "Unknown";
    }, [userServiceDetailsQueryResult?.userService?.last_seen_at]);

    /**
     * CTA label should come from playbook (source of truth),
     * NOT from request.deletion_method (because you may not have a request yet).
     */
    const deletionActionLabel = useMemo(() => {
        const method = playbook?.deletion_method;

        if (method === "link") return "Open deletion page";
        if (method === "email") return "Send deletion email";
        if (method === "manual") return "View deletion guide"; // ✅ Better

        return "Start deletion";
    }, [playbook?.deletion_method]);

    /**
     * Deletion setup score (simple MVP heuristic)
     */
    const deletionSetupScore = useMemo(() => {
        const hasLink = Boolean(playbook?.deletion_url);
        const hasSteps = Boolean(playbook?.steps?.length);
        const hasEmailContact = Boolean(userServiceDetailsQueryResult?.userService?.service?.contact);

        let score = 0;
        if (hasLink) score += 30;
        if (hasSteps) score += 20;
        if (hasEmailContact) score += 20;
        if (gmailConnected) score += 15;
        if (currentPlan === "pro") score += 15;

        return Math.min(100, score);
    }, [
        playbook?.deletion_url,
        playbook?.steps,
        userServiceDetailsQueryResult?.userService?.service?.contact,
        gmailConnected,
        currentPlan,
    ]);

    const openDeletionModal = () => {
        // Profile helps both “link steps” and “email templates”
        if (!deletionProfileQueryResult?.full_name || !deletionProfileQueryResult?.country) {
            setIsDeletionProfileModalOpen(true);
            return;
        }

        // If playbook says "link" and we have the URL, just open it (no modal).
        if (playbook?.deletion_method === "link" && playbook?.deletion_url) {
            window.open(playbook.deletion_url, "_blank", "noopener,noreferrer");
            return;
        }

        // Otherwise open the modal to preview email (and/or show steps inside modal).
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
            queryClient.invalidateQueries({ queryKey: ["user_service_details", userServiceId] }),
            queryClient.invalidateQueries({ queryKey: ["plan"] }),
            queryClient.invalidateQueries({ queryKey: ["gmail_account"] }),
            queryClient.invalidateQueries({ queryKey: ["deletion_profile"] }),
            queryClient.invalidateQueries({ queryKey: ["service_deletion_playbook", serviceId] }),
        ]);
        toast.success("Refreshed");
    };

    return (
        <div className="w-full">
            {/* Top bar */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                {/* Left: back + title/meta */}
                <div className="flex items-start gap-3">
                    <Link href="/dashboard/user_services" className="shrink-0">
                        <Button variant="ghost" size="sm" className="gap-2 px-2 md:px-3">
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
                    <Button variant="outline" size="sm" onClick={refetchEverything} className="w-full md:w-auto">
                        Refresh
                    </Button>

                    <Button size="sm" onClick={openDeletionModal} className="w-full md:w-auto md:min-w-[170px]">
                        {deletionActionLabel}
                    </Button>
                </div>
            </div>

            {/* Loading / Error */}
            {userServiceDetailsQueryResultStatus === "pending" ? (
                <div className="flex min-h-[300px] w-full items-center justify-center">
                    <Spinner className="text-primary size-8" />
                </div>
            ) : userServiceDetailsQueryResultStatus === "error" ? (
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
            ) : !userServiceDetailsQueryResult ? (
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
                                        emailCount={userServiceDetailsQueryResult?.userService?.email_count ?? 0}
                                        breached={breached}
                                        websiteUrl={websiteUrl}
                                        contact={userServiceDetailsQueryResult.userService?.service.contact}
                                        current_plan={currentPlan}
                                    />
                                </TabsContent>

                                <TabsContent value="breaches" className="pt-4">
                                    <BreachesTab userBreaches={userServiceDetailsQueryResult.userBreaches} />
                                </TabsContent>

                                <TabsContent value="deletion_requests" className="pt-4">
                                    <DeletionTab
                                        serviceName={userServiceDetailsQueryResult?.userService?.service?.name}
                                        request={userServiceDetailsQueryResult.deletionRequest}
                                        openModal={openDeletionModal}
                                        setIsDeletionProfileModalOpen={setIsDeletionProfileModalOpen}
                                        primaryActionLabel={deletionActionLabel}
                                        currentPlan={currentPlan}
                                        gmailConnected={gmailConnected}
                                        serviceDeletionPlaybook={playbook}
                                        followUpDays={7} // MVP: hardcoded policy here
                                        userServiceId={userServiceDetailsQueryResult?.userService?.id}
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
                                        <span>
                                            {(userServiceDetailsQueryResult?.userService?.email_count ?? 0).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-white/80">
                                        <span className="text-white/60">Deletion email</span>
                                        <span className="truncate max-w-[180px]">
                                            {playbook?.deletion_email ?? "—"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-white/80">
                                        <span className="text-white/60">Deletion status</span>
                                        <span className="capitalize">
                                            {userServiceDetailsQueryResult?.deletionRequest?.status ?? "none"}
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

                            {/* Deletion setup */}
                            <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                                <h3 className="text-sm font-semibold text-white">Deletion setup</h3>
                                <p className="mt-1 text-xs text-white/60">
                                    What actions are available for this service (link, email, steps, tracking).
                                </p>

                                <div className="mt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/60">Score</span>
                                        <span className="text-xs font-semibold text-white">{deletionSetupScore}/100</span>
                                    </div>

                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                                        <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${deletionSetupScore}%` }} />
                                    </div>

                                    <div className="mt-3 space-y-2 text-xs text-white/70">
                                        {playbook?.deletion_url ? <p>• Deletion link available.</p> : <p>• No deletion link found.</p>}
                                        {playbook?.steps?.length ? <p>• Guided deletion steps available.</p> : <p>• Steps not available yet (we’ll generate them when needed).</p>}

                                        {playbook?.deletion_email ? (
                                            <p>• Deletion email available.</p>
                                        ) : (
                                            <p>• No deletion email available.</p>
                                        )}

                                        {gmailConnected ? (
                                            <p>• Gmail connected (supports tracking + sending if allowed).</p>
                                        ) : (
                                            <p>• Gmail not connected (no tracking or sending).</p>
                                        )}

                                        {currentPlan === "pro" ? <p>• Reminders + tracking enabled.</p> : <p>• Reminders are Pro-only.</p>}
                                        {breached && <p>• Known breach flagged (prioritize cleanup).</p>}
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {currentPlan !== "pro" && (
                                            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                                                <span className="font-medium text-white">Free plan:</span> use links + steps and mark completion manually.{" "}
                                                <Link href="/dashboard/billing?plan=monthly" className="text-primary underline">
                                                    Upgrade
                                                </Link>{" "}
                                                to auto-send emails and reminders.
                                            </div>
                                        )}

                                        <Button size="sm" onClick={openDeletionModal} className="w-full">
                                            {deletionActionLabel}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modals */}
                    <DeletionRequestEmailModal
                        open={isDeletionEmailModalOpen}
                        onOpenChangeAction={setIsDeletionEmailModalOpen}
                        userService={userServiceDetailsQueryResult.userService}
                        gmailAddress={gmailAccountQueryResult?.gmail_address || ""}
                        playbook={serviceDeletionPlaybookQueryResult?.playbook}
                    />

                    <DeletionProfileModal
                        open={isDeletionProfileModalOpen}
                        onOpenChangeAction={setIsDeletionProfileModalOpen}
                        initialCountry={deletionProfileQueryResult?.country}
                        initialFullName={deletionProfileQueryResult?.full_name}
                        setIsDeletionEmailModalOpen={setIsDeletionEmailModalOpen}
                    />
                </div>
            )}
        </div>
    );
}