"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleCheck, ExternalLink, Lock } from "lucide-react";
import { Service } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PrivacyEmailModal from "./privacy-email-modal";

const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

interface ServiceDetailsSheetProps {
    open: boolean;
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
    serviceId: string | undefined;
}

export default function ServiceDetails({
    open,
    onOpenChange,
    serviceId,
}: ServiceDetailsSheetProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [privacyAction, setPrivacyAction] = useState<"delete" | "reduce">("delete");

    const { data: service, status } = useQuery({
        queryKey: ['serviceDetails', serviceId],
        queryFn: async (): Promise<Service> => {

            const res = await fetch(`/api/user-services/${serviceId}`);
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await res.json();
            return data?.service
        },
        enabled: !!serviceId
    })

    const { data: plan } = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch('/api/plan', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch plan data');
            }

            return res.json();
        },
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

    const deleteMyDataAndAccount = () => {
        if (plan?.current_plan !== "pro") {
            toast(() => (
                <div>
                    <span className="font-medium">
                        GhostSweep Pro required
                    </span>
                    <p className="text-sm text-muted-foreground">
                        Unlock privacy request templates and direct contacts.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                    >
                        Upgrade to Pro
                    </Button>
                </div>
            ));
            return;
        }
        setPrivacyAction("delete");
        setModalOpen(true);
    }

    const reduceMyData = () => {
        if (plan?.current_plan !== "pro") {
            toast(() => (
                <div>
                    <span className="font-medium">
                        GhostSweep Pro required
                    </span>
                    <p className="text-sm text-muted-foreground">
                        Unlock privacy request templates and direct contacts.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        >
                        Upgrade to Pro
                        </Button>
                </div>
            ));
            return;
        }
        setPrivacyAction("reduce");
        setModalOpen(true);
    }

    if (!serviceId) return null;


    const lastSeen = service?.last_seen_at ? formatDate(service.last_seen_at) : "Unknown";
    const firstSeen = service?.first_seen_at ? formatDate(service.first_seen_at) : "Unknown";
    const emailCount = service?.email_count ?? 0;
    const breached = service?.service.is_breached === true;

    const serviceName = service?.service?.name || "Unknown service";
    const domain = service?.service?.domain || "";
    const category = service?.service?.category || "Unknown";

    const websiteUrl = domain ? `https://${domain}` : null;

    return (
        <>
        <Sheet open={open} onOpenChange={() => onOpenChange(!open)}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-[#050505] border-l border-white/10 px-4 overflow-scroll pb-10">
                {status === "pending" ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <Spinner className="text-primary size-8" />
                    </div>
                ) : status === "error" ? (
                    <div className="flex h-full w-full flex-col items-center justify-center text-center space-y-4">
                        <h2 className="text-lg font-semibold">Error loading service</h2>
                        <p className="text-sm text-muted-foreground">
                            There was a problem fetching the service details. Please try again later.
                        </p>
                    </div>
                ) :
                    (<>
                        <SheetHeader className="space-y-2">
                            <SheetTitle className="flex flex-col gap-1">
                                <span className="text-base text-muted-foreground">Service details</span>
                                <span className="text-xl font-semibold">{serviceName}</span>
                                {domain && (
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {domain}
                                    </span>
                                )}
                            </SheetTitle>
                            <SheetDescription>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {category}
                                    </Badge>

                                    {breached ? (
                                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                            Breached
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs">
                                            No known breach
                                        </Badge>
                                    )}
                                </div>
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Last seen</div>
                                    <div className="font-medium">{lastSeen}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">First seen</div>
                                    <div className="font-medium">{firstSeen}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Emails detected</div>
                                    <div className="font-medium">{emailCount}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Status</div>
                                    <div className="font-medium">
                                        {breached ? "At risk" : "Low risk (so far)"}
                                    </div>
                                </div>
                            </div>

                            {/* Breach section (MVP simple) */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Breaches</h3>
                                {breached ? (
                                    <p className="text-xs leading-relaxed text-red-200/80 bg-red-500/5 border border-red-500/20 rounded-md p-3">
                                        This service appears in at least one known data breach associated
                                        with your email. Consider changing your password, enabling
                                        two-factor authentication, and reviewing devices/sessions.
                                    </p>
                                ) : (
                                    <p className="text-xs leading-relaxed text-muted-foreground bg-zinc-900/60 border border-zinc-800 rounded-md p-3">
                                        No known breaches found for this service from our current breach
                                        sources. This does not guarantee the service has never been
                                        breached — just that we don’t have a matching record yet.
                                    </p>
                                )}
                            </div>

                            {/* What you can do */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Recommended next steps</h3>
                                <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1.5">
                                    <li>Use a unique, strong password for this account.</li>
                                    <li>Enable two-factor authentication if available.</li>
                                    <li>
                                        Review recent activity and connected devices.
                                    </li>
                                    <li>
                                        If you no longer use this service, look for{" "}
                                        <span className="font-medium text-foreground">Delete account</span>{" "}
                                        or <span className="font-medium text-foreground">Close my account</span>{" "}
                                        in the settings.
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex flex-col gap-2">
                                {websiteUrl && (
                                    <Button
                                        asChild
                                        size="sm"
                                        className="justify-between bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20"
                                    >
                                        <a href={websiteUrl} target="_blank" rel="noreferrer">
                                            Open website
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}

                                {service?.service?.default_privacy_email && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="justify-between border-white/20 bg-white/5"
                                            onClick={() => {
                                                navigator.clipboard
                                                    .writeText(service?.service?.default_privacy_email || "")
                                                    .then(() => {
                                                        toast(() => (
                                                            <div className="flex flex-row items-center gap-2">
                                                                <CircleCheck color="green" /> Privacy email copied to clipboard
                                                            </div>
                                                        ));
                                                    })
                                                    .catch(() => { });
                                            }}
                                        >
                                            Copy privacy email
                                            <span className="text-xs text-muted-foreground">
                                                {service?.service?.default_privacy_email}
                                            </span>
                                        </Button>
                                    </>
                                )}
                            </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full">Send Privacy Request Email</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="max-w-sm min-w-72 w-full" align="start">
                                        <DropdownMenuItem className="focus:bg-red-600/10 focus:text-red-400" onClick={deleteMyDataAndAccount}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>Delete my data & account</span> 
                                                {plan?.current_plan !== "pro" && <Lock color="yellow" />}
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-red-600/10 focus:text-red-400" onClick={reduceMyData}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>Reduce my data usage</span>
                                                {plan?.current_plan !== "pro" && <Lock color="yellow" />}
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground border-t border-white/5 pt-4">
                                GhostSweep analyses your email metadata (From, Subject, Date) to
                                detect services linked to your inbox. We never read or store the
                                bodies of your emails.
                            </p>
                        </div>
                    </>)}
            </SheetContent>
        </Sheet>
            <PrivacyEmailModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                action={privacyAction}
                service={service}        
                userEmail={user?.gmail_address || ""}     
            />
        </>
    );
}