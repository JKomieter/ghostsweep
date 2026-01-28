"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQueries, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Copy, ShieldAlert, CheckCircle2 } from "lucide-react";
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

import { OutLookLogo, GmailLogo } from "@/svgs";

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
    const queries = useQueries({
        queries: [
            {
            queryKey: ["plan"],
            queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
                const res = await fetch("/api/plan", { method: "GET" });
                if (!res.ok) throw new Error("Failed to fetch plan data");
                return res.json();
            },
            },
            {
            queryKey: ["gmail_account"],
            queryFn: async (): Promise<{ accounts: { id: string; gmail_address: string }[] }> => {
                const res = await fetch("/api/gmail_account");
                if (!res.ok) throw new Error("Failed to fetch Gmail account");
                return res.json();
            },
            refetchOnWindowFocus: false,
            },
            {
            queryKey: ["microsoft_account"],
            queryFn: async (): Promise<{ accounts: { id: string; outlook_address: string }[] }> => {
                const res = await fetch("/api/microsoft_account");
                if (!res.ok) throw new Error("Failed to fetch Microsoft account");
                return res.json();
            },
            refetchOnWindowFocus: false,
            },
            {
            queryKey: ["deletion_profile"],
            queryFn: async (): Promise<DeletionProfileQueryResult> => {
                const res = await fetch("/api/deletion_profile");
                if (!res.ok) throw new Error("Failed to fetch deletion profile");
                return res.json();
            },
            },
            {
            queryKey: ["user_service_details", userServiceId],
            queryFn: async (): Promise<UserServiceDetailsQueryResult> => {
                const res = await fetch(`/api/user_services/${userServiceId}`);
                if (!res.ok) throw new Error("Failed to fetch service details");
                return res.json();
            },
            enabled: !!userServiceId,
            },
        ],
        });

        const [
        planQuery,
        gmailAccountQuery,
        microsoftAccountQuery,
        deletionProfileQuery,
        userServiceDetailsQuery,
        ] = queries;

        const planQueryResult = planQuery.data;
        const gmailAccountQueryResult = gmailAccountQuery.data;
        const microsoftAccountQueryResult = microsoftAccountQuery.data;
        const deletionProfileQueryResult = deletionProfileQuery.data;
        const userServiceDetailsQueryResult = userServiceDetailsQuery.data;
        const userServiceDetailsQueryResultStatus = userServiceDetailsQuery.status;
        const error = userServiceDetailsQuery.error;

    const currentPlan = planQueryResult?.current_plan ?? "free";

    const userService = userServiceDetailsQueryResult?.userService;
    const targetEmail = userService?.email;

    // Check against the list to find if THIS specific email is connected
    const matchedGmail = gmailAccountQueryResult?.accounts?.find((a) => a.gmail_address === targetEmail);
    const matchedOutlook = microsoftAccountQueryResult?.accounts?.find((a) => a.outlook_address === targetEmail);

    const gmailConnected = Boolean(matchedGmail);
    const outlookConnected = Boolean(matchedOutlook);
    const emailConnected = gmailConnected || outlookConnected; // Connected via any provider
    const connectedEmail = matchedGmail?.gmail_address || matchedOutlook?.outlook_address || null;
    
    // Only Gmail allows sending via GhostSweep for now.
    // If Outlook is connected, we consider "emailConnected" true (for score/badges), 
    // but automated sending features should be disabled.
    const canSendEmail = gmailConnected; 

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

    // Whitelist mutation
    const toggleWhitelist = useMutation({
        mutationFn: async ({ isWhitelisted }: { isWhitelisted: boolean }) => {
            const res = await fetch(`/api/user_services/${userServiceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_whitelisted: isWhitelisted }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "Failed to update whitelist");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success(
                userService?.is_whitelisted
                    ? `${userService?.service?.name} removed from whitelist`
                    : `${userService?.service?.name} whitelisted`
            );
            queryClient.invalidateQueries({ queryKey: ["user_service_details", userServiceId] });
            queryClient.invalidateQueries({ queryKey: ["user_services"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || `Failed to update whitelist`);
        },
    });

    // Manual deletion completion mutation
    const markAsDeleted = useMutation({
        mutationFn: async () => {
            const deletionRequest = userServiceDetailsQueryResult?.deletionRequest;

            // If no deletion request exists, create one with completed status
            if (!deletionRequest) {
                const res = await fetch("/api/deletion_requests/post", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_service_id: userServiceId,
                        deletion_method: "manual",
                        status: "completed",
                        user_notes: "Marked as manually deleted by user",
                    }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.error || "Failed to mark as deleted");
                }

                return res.json();
            } else {
                // Update existing deletion request to completed
                const res = await fetch(`/api/deletion_requests/patch/${deletionRequest.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "completed" }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.error || "Failed to mark as completed");
                }

                return res.json();
            }
        },
        onSuccess: () => {
            toast.success("Service marked as deleted!");
            queryClient.invalidateQueries({ queryKey: ["user_service_details", userServiceId] });
            queryClient.invalidateQueries({ queryKey: ["deletion_requests"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to mark as deleted");
        },
    });

    const serviceName =
        userServiceDetailsQueryResult?.userService?.service?.name || "Unknown service";
    const domain = userServiceDetailsQueryResult?.userService?.service?.domain || "";
    const category = userServiceDetailsQueryResult?.userService?.service?.category || "Unknown";
    const breached = userServiceDetailsQueryResult?.userService?.service?.is_breached === true;
    const logoUrl = userServiceDetailsQueryResult?.userService?.service?.logo_url || null;

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
        if (emailConnected) score += 15;
        if (currentPlan === "pro") score += 15;

        return Math.min(100, score);
    }, [
        playbook?.deletion_url,
        playbook?.steps,
        userServiceDetailsQueryResult?.userService?.service?.contact,
        emailConnected,
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
            queryClient.invalidateQueries({ queryKey: ["microsoft_account"] }),
            queryClient.invalidateQueries({ queryKey: ["deletion_profile"] }),
            queryClient.invalidateQueries({ queryKey: ["service_deletion_playbook", serviceId] }),
        ]);
        toast.success("Refreshed");
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Left: back + title/meta */}
                <div className="flex items-start gap-3">
                    <Link href="/dashboard/user_services" className="shrink-0">
                        <Button variant="ghost" size="sm" className="gap-2 px-2 border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline text-sm">Back</span>
                        </Button>
                    </Link>

                    {logoUrl && (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-white/5 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl} alt={serviceName} className="h-full w-full object-cover" />
                        </div>
                    )}

                    <div className="min-w-0 space-y-2">
                        <h1 className="text-2xl font-light tracking-tight text-white">
                            {serviceName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-white/60">
                                {category}
                            </span>

                            {breached ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    <span className="text-xs text-red-400">
                                        Breached
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-emerald-400">
                                        Secure
                                    </span>
                                </div>
                            )}
                        </div>

                        {domain && (
                            <p className="text-sm text-white/40">
                                {domain}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={refetchEverything} className="border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3">
                        Refresh
                    </Button>
                    {/* <Button size="sm" onClick={openDeletionModal} className="md:min-w-[170px]">
                        {deletionActionLabel}
                    </Button> */}
                </div>
            </div>

            {/* Loading / Error */}
            {userServiceDetailsQueryResultStatus === "pending" ? (
                <div className="flex h-96 items-center justify-center rounded-lg border border-white/5 bg-white/2">
                    <Spinner className="text-white size-8" />
                </div>
            ) : userServiceDetailsQueryResultStatus === "error" ? (
                <div className="rounded-lg border border-white/5 bg-white/2 p-6 space-y-3">
                    <h2 className="font-light text-white">Error loading service</h2>
                    <p className="text-sm text-white/60">
                        {(error as Error)?.message || "Something went wrong."}
                    </p>
                    <Button variant="ghost" size="sm" onClick={refetchEverything} className="border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3">
                        Try again
                    </Button>
                </div>
            ) : !userServiceDetailsQueryResult ? (
                <div className="rounded-lg border border-white/5 bg-white/2 p-6">
                    <h2 className="font-light text-white">Service not found</h2>
                    <p className="mt-1 text-sm text-white/60">This record may have been deleted.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Main content */}
                    <div className="lg:col-span-8">
                        <div className="rounded-lg border border-white/5 bg-white/2">
                            <Tabs defaultValue="summary" className="w-full">
                                <TabsList className="w-full justify-start bg-transparent border-b border-white/5 rounded-none px-6 h-12">
                                    <TabsTrigger
                                        value="summary"
                                        className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none px-0 pb-0 text-sm text-white/60 h-12"
                                    >
                                        Summary
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="breaches"
                                        className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none px-0 pb-0 text-sm text-white/60 h-12 ml-6"
                                    >
                                        Breaches
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="deletion_requests"
                                        className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none px-0 pb-0 text-sm text-white/60 h-12 ml-6"
                                    >
                                        Deletion
                                    </TabsTrigger>
                                </TabsList>

                                <div className="p-6">
                                    <TabsContent value="summary" className="mt-0">
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

                                    <TabsContent value="breaches" className="mt-0">
                                        <BreachesTab userBreaches={userServiceDetailsQueryResult.userBreaches} />
                                    </TabsContent>

                                    <TabsContent value="deletion_requests" className="mt-0">
                                        <DeletionTab
                                            serviceName={userServiceDetailsQueryResult?.userService?.service?.name}
                                            request={userServiceDetailsQueryResult.deletionRequest}
                                            openModal={openDeletionModal}
                                            setIsDeletionProfileModalOpen={setIsDeletionProfileModalOpen}
                                            primaryActionLabel={deletionActionLabel}
                                            currentPlan={currentPlan}
                                            gmailConnected={canSendEmail}
                                            serviceDeletionPlaybook={playbook}
                                            followUpDays={7}
                                            userServiceId={userServiceDetailsQueryResult?.userService?.id}
                                        />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right rail */}
                    <div className="lg:col-span-4">
                        <div className="space-y-6">
                            {/* Quick info */}
                            <div className="rounded-lg border border-white/5 bg-white/2 p-5 space-y-4">
                                <h3 className="text-[11px] font-medium uppercase tracking-widest text-white/40">Quick info</h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/40">First seen</span>
                                        <span className="text-white/80">{firstSeen}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-white/40">Last seen</span>
                                        <span className="text-white/80">{lastSeen}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-white/40">Emails</span>
                                        <span className="text-white/80">
                                            {(userServiceDetailsQueryResult?.userService?.email_count ?? 0).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-white/40">Status</span>
                                        <span className="capitalize text-xs text-white/60">
                                            {userServiceDetailsQueryResult?.deletionRequest?.status ?? "none"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-white/40">Whitelisted</span>
                                        {userService?.is_whitelisted ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                <span className="text-xs text-white/60">Yes</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-white/60">No</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    {websiteUrl && (
                                        <a href={websiteUrl} target="_blank" rel="noreferrer" className="w-full">
                                            <Button variant="ghost" size="sm" className="gap-2 w-full border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3">
                                                Visit website <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </a>
                                    )}
                                    {domain && (
                                        <Button variant="ghost" size="sm" className="gap-2 w-full border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3" onClick={copyDomain}>
                                            Copy domain <Copy className="h-3 w-3" />
                                        </Button>
                                    )}

                                    <Button
                                        variant={userService?.is_whitelisted ? "ghost" : "default"}
                                        size="sm"
                                        className={userService?.is_whitelisted ? "gap-2 w-full border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3" : "gap-2 w-full bg-white text-black hover:bg-white/90"}
                                        onClick={() => toggleWhitelist.mutate({ isWhitelisted: !userService?.is_whitelisted })}
                                        disabled={toggleWhitelist.isPending}
                                    >
                                        {toggleWhitelist.isPending ?
                                        <Spinner className="text-white size-4" /> :
                                        userService?.is_whitelisted ? "Remove from whitelist" : "Add to whitelist"}
                                    </Button>

                                    {userServiceDetailsQueryResult?.deletionRequest?.status !== "completed" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 w-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                                            onClick={() => markAsDeleted.mutate()}
                                            disabled={markAsDeleted.isPending}
                                        >
                                            {markAsDeleted.isPending ?
                                            <Spinner className="text-white size-4" /> :
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                Mark as deleted
                                            </>}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Deletion setup */}
                            <div className="rounded-lg border border-white/5 bg-white/2 p-5 space-y-4">
                                <div>
                                    <h3 className="text-[11px] font-medium uppercase tracking-widest text-white/40">Deletion setup</h3>
                                    <p className="text-xs text-white/60 mt-1">
                                        Available actions for this service.
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/40">Score</span>
                                        <span className="font-light text-white">{deletionSetupScore}/100</span>
                                    </div>

                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                        <div className="h-full bg-white/80 transition-all duration-300" style={{ width: `${deletionSetupScore}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs text-white/60">
                                    {playbook?.deletion_url && <p>✓ Deletion link available</p>}
                                    {playbook?.steps?.length && <p>✓ Deletion steps available</p>}
                                    {playbook?.deletion_email && <p>✓ Deletion email available</p>}
                                    {emailConnected && (
                                        <div className="flex items-center gap-2 text-white/80 pt-1">
                                            {gmailConnected && (
                                                <>
                                                    <GmailLogo className="h-3 w-3" />
                                                    <span>Gmail connected</span>
                                                </>
                                            )}
                                            {outlookConnected && (
                                                <>
                                                    <OutLookLogo className="h-3 w-3" />
                                                    <span>Outlook connected</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {currentPlan === "pro" && <p>✓ Tracking enabled</p>}
                                </div>

                                {currentPlan !== "pro" && (
                                    <div className="rounded-lg border border-white/5 bg-white/2 p-3 text-xs space-y-2">
                                        <p className="text-white/60">
                                            <span className="font-medium text-white/80">Upgrade to Pro</span> for auto-send emails and reminders.
                                        </p>
                                        <Link href="/dashboard/billing?plan=monthly" className="text-white/90 hover:underline text-xs">
                                            View plans →
                                        </Link>
                                    </div>
                                )}

                                <div className="rounded-lg border border-white/5 bg-white/2 p-3 text-xs space-y-2">
                                    <p className="text-white/60">
                                        View the <span className="font-medium text-white/80">Deletion tab</span> to start removing your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modals */}
                    <DeletionRequestEmailModal
                        open={isDeletionEmailModalOpen}
                        onOpenChangeAction={setIsDeletionEmailModalOpen}
                        userService={userServiceDetailsQueryResult?.userService}
                        gmailAddress={connectedEmail || ""}
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