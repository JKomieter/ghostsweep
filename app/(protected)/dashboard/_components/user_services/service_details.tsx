"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
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
                        <Button variant="ghost" size="sm" className="gap-2 px-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline text-sm">Back</span>
                        </Button>
                    </Link>

                    <div className="min-w-0 space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {serviceName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {category}
                            </Badge>

                            {breached ? (
                                <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
                                    <ShieldAlert className="mr-1 h-3 w-3" />
                                    Breached
                                </Badge>
                            ) : (
                                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-xs">
                                    Secure
                                </Badge>
                            )}
                        </div>

                        {domain && (
                            <p className="text-sm text-muted-foreground">
                                {domain}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refetchEverything}>
                        Refresh
                    </Button>
                    {/* <Button size="sm" onClick={openDeletionModal} className="md:min-w-[170px]">
                        {deletionActionLabel}
                    </Button> */}
                </div>
            </div>

            {/* Loading / Error */}
            {userServiceDetailsQueryResultStatus === "pending" ? (
                <div className="flex h-96 items-center justify-center rounded-lg border border-border">
                    <Spinner className="text-primary size-8" />
                </div>
            ) : userServiceDetailsQueryResultStatus === "error" ? (
                <div className="rounded-lg border border-border p-6 space-y-3">
                    <h2 className="font-semibold">Error loading service</h2>
                    <p className="text-sm text-muted-foreground">
                        {(error as Error)?.message || "Something went wrong."}
                    </p>
                    <Button variant="outline" size="sm" onClick={refetchEverything}>
                        Try again
                    </Button>
                </div>
            ) : !userServiceDetailsQueryResult ? (
                <div className="rounded-lg border border-border p-6">
                    <h2 className="font-semibold">Service not found</h2>
                    <p className="mt-1 text-sm text-muted-foreground">This record may have been deleted.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Main content */}
                    <div className="lg:col-span-8">
                        <div className="rounded-lg border border-border">
                            <Tabs defaultValue="summary" className="w-full">
                                <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none px-4 h-10">
                                    <TabsTrigger
                                        value="summary"
                                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-0 text-sm h-10"
                                    >
                                        Summary
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="breaches"
                                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-0 text-sm h-10 ml-6"
                                    >
                                        Breaches
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="deletion_requests"
                                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-0 text-sm h-10 ml-6"
                                    >
                                        Deletion
                                    </TabsTrigger>
                                </TabsList>

                                <div className="p-4">
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
                            <div className="rounded-lg border border-border p-4 space-y-3">
                                <h3 className="text-sm font-semibold">Quick info</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">First seen</span>
                                        <span>{firstSeen}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Last seen</span>
                                        <span>{lastSeen}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Emails</span>
                                        <span>
                                            {(userServiceDetailsQueryResult?.userService?.email_count ?? 0).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="capitalize text-xs">
                                            {userServiceDetailsQueryResult?.deletionRequest?.status ?? "none"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    {websiteUrl && (
                                        <a href={websiteUrl} target="_blank" rel="noreferrer" className="w-full">
                                            <Button variant="outline" size="sm" className="gap-2 w-full">
                                                Visit website <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </a>
                                    )}
                                    {domain && (
                                        <Button variant="outline" size="sm" className="gap-2 w-full" onClick={copyDomain}>
                                            Copy domain <Copy className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Deletion setup */}
                            <div className="rounded-lg border border-border p-4 space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold">Deletion setup</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Available actions for this service.
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Score</span>
                                        <span className="font-semibold">{deletionSetupScore}/100</span>
                                    </div>

                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${deletionSetupScore}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-1 text-xs text-muted-foreground">
                                    {playbook?.deletion_url && <p>✓ Deletion link available</p>}
                                    {playbook?.steps?.length && <p>✓ Deletion steps available</p>}
                                    {playbook?.deletion_email && <p>✓ Deletion email available</p>}
                                    {emailConnected && (
                                        <div className="flex items-center gap-2 text-foreground pt-1">
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
                                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-2">
                                        <p className="text-muted-foreground">
                                            <span className="font-medium text-foreground">Upgrade to Pro</span> for auto-send emails and reminders.
                                        </p>
                                        <Link href="/dashboard/billing?plan=monthly" className="text-primary hover:underline text-xs">
                                            View plans →
                                        </Link>
                                    </div>
                                )}

                                <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-2">
                                    <p className="text-muted-foreground">
                                        View the <span className="font-medium text-foreground">Deletion tab</span> to start removing your account.
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