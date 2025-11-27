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

import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrivacyEmailModal from "../privacy-email-modal";
import BreachesTab from "../service-tabs/breaches-tab";
import { PrivacyRequest, PrivacyRequestsTab } from "../service-tabs/privacy-requests-tab";
import SummaryTab from "../service-tabs/summary-tab";
import Link from "next/link";


const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export interface ServiceQueryResult {
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
        default_privacy_email: string | null;
        category: Category | null;
        is_breached: boolean | null;
    };
    breaches: {
        id: string;
        breach_id: string;
        email: string | null;
        domain: string | null;
        breach_date: string | null;
        data_classes: string[] | null;
        is_sensitive: boolean | null;
        raw: {
            [key: string]: unknown;
        } | null;
    }[];
    privacyRequest: PrivacyRequest | null
}

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
        queryFn: async (): Promise<ServiceQueryResult> => {

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
                        GhostSweep Professional required
                    </span>
                    <p className="text-sm text-muted-foreground">
                        Unlock privacy request templates and direct contacts.
                    </p>
                    <Link href="/dashboard/billing?plan=monthly">
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                        >
                            Upgrade to Pro
                        </Button>
                    </Link>
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
                        GhostSweep Professional required
                    </span>
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
                                        value="privacy"
                                        className="data-[state=active]:border-b data-[state=active]:border-primary data-[state=active]:text-white rounded-none px-3 pb-2 text-sm"
                                    >
                                        Privacy Requests
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="summary">
                                    <SummaryTab
                                        lastSeen={lastSeen}
                                        firstSeen={firstSeen}
                                        emailCount={emailCount}
                                        breached={breached}
                                        websiteUrl={websiteUrl}
                                        default_privacy_email={service?.service.default_privacy_email}
                                        current_plan={plan?.current_plan}
                                        deleteMyDataAndAccount={deleteMyDataAndAccount}
                                        reduceMyData={reduceMyData}
                                    />
                                </TabsContent>
                                <TabsContent value="breaches">
                                    <BreachesTab
                                        breaches={service.breaches}
                                        deleteMyDataAndAccount={deleteMyDataAndAccount}
                                        reduceMyData={reduceMyData}
                                    />
                                </TabsContent>
                                <TabsContent value="privacy">
                                    <PrivacyRequestsTab
                                        serviceName={service.service.name}
                                        request={service.privacyRequest}
                                        deleteMyDataAndAccount={deleteMyDataAndAccount}
                                        reduceMyData={reduceMyData}
                                    />
                                </TabsContent>
                            </Tabs>

                        </>)}
                </SheetContent>
            </Sheet>
            <PrivacyEmailModal
                open={modalOpen}
                onOpenChangeAction={setModalOpen}
                action={privacyAction}
                service={service}
                userEmail={user?.gmail_address || ""}
            />
        </>
    );
}