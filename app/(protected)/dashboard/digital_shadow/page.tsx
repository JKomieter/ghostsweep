/* eslint-disable react/no-unescaped-entities */
/* app/dashboard/digital-shadow/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Lock, Share2, ArrowRight, AlertTriangle } from "lucide-react";
import StatsOverview from "../_components/digital_shadow/stats-overview";
import { useIsMobile } from "../_components/digital_shadow/helpers";
import PreviewContent from "../_components/digital_shadow/preview-content";
import ProContent from "../_components/digital_shadow/pro-content";
import { OptOutRequest } from "@/types";

// -------------------- Types --------------------
export type Confidence = "confirmed" | "likely" | "possible";

export type BrokerOut = {
    id?: string;
    name: string;
    type: "ad_network" | "broker" | "government" | "other";
    category?: string | null;
    serviceCount: number;
    highestConfidence: Confidence;
    removal_url?: string | null;
    contact_email?: string | null;
    description?: string | null;
    services?: Array<{
        id: string;
        name?: string | null;
        domain?: string | null;
        category?: string | null;
        confidence: Confidence;
        source?: string | null;
    }>;
    optOutRequest?: Pick<OptOutRequest, "status" | "method" | "updated_at" | "notes"> | null;
};

export type DigitalShadowResponse =
    | {
        preview: true;
        isPro: false;
        stats: {
            totalServices: number;
            totalBrokers: number;
            totalLinks: number;
            byType: Record<string, number>;
            riskScore: number;
        };
        topBrokers: Array<Pick<BrokerOut, "name" | "type" | "serviceCount" | "highestConfidence">>;
        lockedCount: number;
        upgradeMessage?: string;
    }
    | {
        preview: false;
        isPro: true;
        brokers: BrokerOut[];
        stats: {
            totalServices: number;
            totalBrokers: number;
            totalLinks: number;
            byType: Record<string, number>;
            byConfidence: Record<string, number>;
            byCategory: Record<string, number>;
            topBrokers: BrokerOut[];
            riskScore: number;
        };
    }
    | {
        message: string;
        brokers: [];
        stats: null;
        isPro: boolean;
    };



// -------------------- Page --------------------
export default function DigitalShadowPage() {
    const isMobile = useIsMobile(900);

    const { data, status, error, refetch } = useQuery<DigitalShadowResponse>({
        queryKey: ["digital_shadow"],
        queryFn: async () => {
            const res = await fetch("/api/digital-shadow", { cache: "no-store" });
            const j = (await res.json().catch(() => ({}))) as DigitalShadowResponse;
            if (!res.ok) throw new Error((j as any)?.error ?? "Failed to load digital shadow");
            return j;
        },
        refetchOnWindowFocus: false,
        staleTime: 60_000,
    });

    const isLoading = status === "pending";
    const isError = status === "error";

    const header = (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">
                    Digital Shadow Map
                </h1>
                <p className="text-sm text-white/60">
                    Track your data exposure across the internet
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {/* <Button
                    variant="outline"
                    size="sm"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => {
                        const url = typeof window !== "undefined" ? window.location.href : "";
                        navigator.clipboard?.writeText(url);
                    }}
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button> */}

                {"preview" in (data ?? {}) && (data as any).preview ? (
                    <Link href="/dashboard/billing">
                        <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
                            <Lock className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                        </Button>
                    </Link>
                ) : null}
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608]">
            <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
                {header}

                {/* Loading / Error */}
                {isLoading ? (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-8 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Spinner className="h-8 w-8 text-emerald-500" />
                            <div className="space-y-0.5">
                                <div className="text-white font-medium text-sm">Analyzing your digital footprint</div>
                                <div className="text-xs text-white/60">This may take a moment...</div>
                            </div>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-semibold text-sm">Failed to load your Digital Shadow</div>
                                <div className="mt-1 text-xs text-white/60">{(error as any)?.message ?? "Unknown error occurred"}</div>
                                <div className="mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                                        onClick={() => refetch()}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : !data ? null : "stats" in data && data.stats === null ? (
                    // No scan yet
                    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                        <div className="space-y-3">
                            <h3 className="text-lg text-white font-semibold">{(data as any).message ?? "No services detected yet"}</h3>
                            <p className="text-sm text-white/70">
                                Run your first email sweep to discover your digital footprint. We'll analyze your inbox to find all the services you've signed up for and show you which data brokers have access to your information.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-2">
                                <Link href="/dashboard">
                                    <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
                                        Start Your First Sweep <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                                <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                                    Learn More
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats Overview */}
                        <StatsOverview data={data} />

                        {/* Main Content */}
                        {"preview" in data && data.preview ? (
                            <PreviewContent data={data} />
                        ) : (
                            <ProContent data={data as any} preferCards={isMobile} />
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

















