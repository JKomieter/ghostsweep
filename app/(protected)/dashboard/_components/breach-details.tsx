"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";
import PrivacyEmailModal from "./privacy-email-modal";
import { useState } from "react";
import { ServiceQueryResult } from "./services/service-details";

type PrivacyStatus =
    | "drafted"
    | "sent"
    | "received"
    | "needs_verification"
    | "in_progress"
    | "completed"
    | "failed"
    | "expired";

type PrivacyAction = "delete" | "reduce";

type BreachDetails = {
    id: string;
    domain: string | null;
    breach_date: string | null;
    pwn_count: number | null;
    data_classes: string[] | null;
    is_sensitive: boolean | null;
    raw: {
        name?: string | null;
        title?: string | null;
        description?: string | null;
        logo_path?: string | null;
    } | null;
};

type ServiceInfo = {
    id: string;
    name: string | null;
    domain: string | null;
    default_privacy_email: string | null;
    category: string | null;
    is_breached: boolean | null;
};

type PrivacyRequest = {
    id: string;
    action: PrivacyAction;
    status: PrivacyStatus;
    sent_at: string | null;
    last_reply_at: string | null;
    last_notified_status: PrivacyStatus | null;
} | null;

type BreachDetailsResponse = {
    breach: {
        user_breach_id: string;
        user_id: string;
        user_email: string | null;
        breach_id: string;
        service_id: string;
        details: BreachDetails;
    };
    service: ServiceInfo | null;
    privacy_request: PrivacyRequest | null;
};

interface BreachDetailsSheetProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    breachId: string | null;
    onStartPrivacyAction?: (opts: {
        serviceId: string;
        action: PrivacyAction;
    }) => void;
}

function severityBadge(breach: BreachDetails) {
    const pwn = breach.pwn_count ?? 0;
    const sensitive = breach.is_sensitive ?? false;

    if (sensitive || pwn > 10_000_000) {
        return {
            label: "High",
            className: "bg-red-500/20 text-red-200 border-red-500/40",
        };
    }

    if (pwn > 100_000) {
        return {
            label: "Medium",
            className: "bg-amber-500/20 text-amber-200 border-amber-500/40",
        };
    }

    return {
        label: "Low",
        className: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    };
}

function privacyStatusLabel(status: PrivacyStatus) {
    switch (status) {
        case "completed":
            return { label: "Completed", className: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" };
        case "in_progress":
            return { label: "In progress", className: "bg-amber-500/15 text-amber-200 border-amber-500/30" };
        case "needs_verification":
            return { label: "Needs verification", className: "bg-blue-500/15 text-blue-200 border-blue-500/30" };
        case "failed":
            return { label: "Failed", className: "bg-red-500/20 text-red-200 border-red-500/40" };
        case "sent":
            return { label: "Sent", className: "bg-zinc-500/15 text-zinc-200 border-zinc-500/30" };
        case "received":
            return { label: "Reply received", className: "bg-purple-500/15 text-purple-200 border-purple-500/30" };
        case "expired":
            return { label: "Expired", className: "bg-zinc-800/60 text-zinc-300 border-zinc-700" };
        case "drafted":
        default:
            return { label: "Drafted", className: "bg-zinc-500/15 text-zinc-200 border-zinc-500/30" };
    }
}

export function BreachDetailsSheet({
    open,
    onOpenChangeAction,
    breachId,
}: BreachDetailsSheetProps) {
    const [privacyAction, setPrivacyAction] = useState<"delete" | "reduce">("delete");
    const [openModal, setOpenModal] = useState(false)

    const { data, isLoading, error } = useQuery<BreachDetailsResponse>({
        queryKey: ["breach-details", breachId],
        enabled: open && !!breachId,
        queryFn: async () => {
            if (!breachId) throw new Error("No breachId provided");
            const res = await fetch(`/api/user-breaches/${breachId}`);
            if (!res.ok) throw new Error("Failed to load breach details");
            return res.json();
        },
        staleTime: 60_000,
    });

    const { data: serviceDetails } = useQuery({
        queryKey: ['serviceDetails', data?.service?.id],
        queryFn: async (): Promise<ServiceQueryResult> => {

            const res = await fetch(`/api/user-services/${data?.service?.id}`);
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            const json = await res.json();
            return json?.service
        },
        enabled: !!data?.service?.id
    })

    const { data: user } = useQuery({
        queryKey: ['gmailAccount'],
        queryFn: async (): Promise<{ gmail_address: string | null }> => {
            const res = await fetch('/api/gmail_account');
            if (!res.ok) {
                throw new Error('Failed to fetch Gmail account');
            }
            return res.json();
        },
        refetchOnWindowFocus: false,
    })

    const breach = data?.breach?.details;
    const service = data?.service;
    const privacyRequest = data?.privacy_request;

    const severity = breach ? severityBadge(breach) : null;

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChangeAction}>
                <SheetContent className="w-full sm:max-w-xl bg-[#050505] border-l border-white/10 text-sm px-4">
                    <SheetHeader className="space-y-2">
                        <SheetTitle className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                Breach details
                            </span>
                            <span className="text-lg font-semibold">
                                {service?.name || breach?.raw?.title || "Service breach"}
                            </span>
                        </SheetTitle>
                        <SheetDescription>
                            Full context on what was exposed, when, and what you can do next.
                        </SheetDescription>
                    </SheetHeader>

                    {/* Loading / error / empty states */}
                    {isLoading && (
                        <div className="mt-6 text-xs text-muted-foreground">
                            Loading breach details…
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="mt-6 text-xs text-red-400">
                            Could not load breach details. Please try again.
                        </div>
                    )}

                    {!isLoading && !error && breach && service && (
                        <div className="mt-5 space-y-6">
                            {/* Top summary row */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-medium">
                                            {service.name || breach.raw?.name || "Unknown service"}
                                        </span>
                                        {service.domain && (
                                            <span className="text-xs text-muted-foreground">
                                                {service.domain}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {severity && (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[11px] px-2 py-0.5 border",
                                                    severity.className
                                                )}
                                            >
                                                Severity: {severity.label}
                                            </Badge>
                                        )}
                                        {breach.breach_date && (
                                            <Badge
                                                variant="outline"
                                                className="text-[11px] border-white/15 bg-white/5 text-white/80"
                                            >
                                                Breach date: {formatDate(breach.breach_date)}
                                            </Badge>
                                        )}
                                        {breach.pwn_count && breach.pwn_count > 0 && (
                                            <span className="text-[11px] text-muted-foreground">
                                                ~{breach.pwn_count.toLocaleString()} accounts affected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Privacy request status badge */}
                                {privacyRequest && (
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                            Deletion / data request
                                        </span>
                                        {(() => {
                                            const ps = privacyStatusLabel(privacyRequest.status);
                                            return (
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[11px] px-2 py-0.5 border",
                                                        ps.className
                                                    )}
                                                >
                                                    {ps.label}
                                                </Badge>
                                            );
                                        })()}
                                        <span className="text-[11px] text-muted-foreground">
                                            {privacyRequest.sent_at
                                                ? `Started ${formatDate(privacyRequest.sent_at)}`
                                                : "Not yet sent"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Data exposed */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-white/80">
                                    Data exposed
                                </h3>
                                {breach.data_classes && breach.data_classes.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {breach.data_classes.map((dc) => (
                                            <Badge
                                                key={dc}
                                                variant="outline"
                                                className="text-[11px] border-white/10 bg-white/5 text-white/80"
                                            >
                                                {dc}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        The breach record did not specify exact data types.
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-white/80">
                                    What happened
                                </h3>
                                <div className="rounded-md border border-white/10 bg-black/50 p-3 max-h-48 overflow-auto">
                                    <p className="text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
                                        {breach.raw?.description
                                            ? String(breach.raw.description)
                                            : "No public incident description was provided for this breach."}
                                    </p>
                                </div>
                            </div>

                            {/* Recommended actions */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-white/80">
                                    Recommended next steps
                                </h3>
                                <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                    <li>
                                        If you still use this account, update your password and enable
                                        two-factor authentication (2FA).
                                    </li>
                                    <li>
                                        If you no longer want this company holding your data, send a{" "}
                                        <span className="font-medium">deletion request</span> using
                                        GhostSweep’s legal email template.
                                    </li>
                                    <li>
                                        Monitor for similar emails, phishing attempts, or suspicious
                                        logins on related services.
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                <div className="text-[11px] text-muted-foreground max-w-xs">
                                    GhostSweep can generate a ready-to-send email to ask{" "}
                                    <span className="font-medium">
                                        {service.name || breach.raw?.name || "this company"}
                                    </span>{" "}
                                    to delete or reduce their use of your data.
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-white/20 text-xs"
                                        onClick={() => {
                                            setPrivacyAction("reduce")
                                            setOpenModal(true)
                                        }}
                                    >
                                        Request reduced data use
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-primary text-black hover:bg-primary/80 text-xs"
                                        onClick={() => {
                                            setPrivacyAction("delete")
                                            setOpenModal(true)
                                        }}
                                    >
                                        Request deletion
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
            <PrivacyEmailModal
                open={openModal}
                onOpenChangeAction={setOpenModal}
                action={privacyAction}
                service={serviceDetails}
                userEmail={user?.gmail_address || ""}
            />
        </>
    );
}