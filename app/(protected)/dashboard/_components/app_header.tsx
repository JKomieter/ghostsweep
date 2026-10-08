"use client"

import { Button } from "@/components/ui/button";
import { Logo } from "@/svgs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings, HelpCircle, LogOut, ChevronDown, Sparkles, Plus, FileText } from "lucide-react";
import { GmailLogo, OutLookLogo } from "@/svgs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SupportModal } from "./support-modal";
import { toast } from "sonner";
import SlidingSidebar from "./app_sidebar";
import Notifications from "./notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import useGetUser from "@/hooks/use-get-user";
import { usePrivacyReport } from "@/hooks/use-privacy-report";


type LatestSweepResponse = {
    sweepId: string | null;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled" | null;
    progress?: number | null;
    phaseLabel?: string | null;
    phaseStep?: number | null;
    phaseCount?: number | null;
    messagesProcessed?: number | null;
    startedAt?: string | null;
};


export default function Header() {
    const [openSupport, setOpenSupport] = useState(false)
    const [currentTime, setCurrentTime] = useState(() => Date.now())
    const {data: user} = useGetUser()
    const { requestReport, downloadLatestReport, isGenerating: isReportGenerating, latestReport } = usePrivacyReport()

    const pathname = usePathname();

    const { data, status } = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "buster" | "pro"; scan_credits_remaining?: number }> => {
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

    const userEmail = user?.email ?? '';
    const userInitials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'GS';

    // Latest sweep status (for header progress outside dashboard)
    const { data: latestSweep } = useQuery({
        queryKey: ["latestSweep", "header"],
        queryFn: async (): Promise<LatestSweepResponse> => {
            const res = await fetch("/api/sweep/status/latest");
            if (!res.ok) throw new Error("Failed to fetch latest sweep");
            return res.json();
        },
        refetchInterval: (query) => {
            const data = query.state.data as LatestSweepResponse | undefined;
            if (!data) return false;
            return data.status === "pending" || data.status === "processing" || data.status === "cancelled"
                ? 5000
                : false;
        },
        refetchOnWindowFocus: true,
    });

    const isInProgress = latestSweep?.status === "pending" || latestSweep?.status === "processing";

    const elapsedMinutes = useMemo(() => {
        if (!latestSweep?.startedAt) return 0;
        const elapsed = currentTime - new Date(latestSweep.startedAt).getTime();
        return Math.floor(elapsed / 60000);
    }, [latestSweep, currentTime]);

    useEffect(() => {
        if (!latestSweep?.startedAt) return;

        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [latestSweep?.startedAt]);

    const handleLogout = async () => {
        try {
            await fetch("/api/signout", {
                method: "POST"
            })
            window.location.href = "/login"
        } catch (error) {
            console.error("Failed to log out. Please try again.", error)
            toast.error("Failed to log out. Please try again.")
        }
    }

    const isBusterActive = data?.current_plan === "buster" && (data?.scan_credits_remaining ?? 0) > 0;
    const isBusterAudited = data?.current_plan === "buster" && (data?.scan_credits_remaining ?? 0) === 0;
    const isPaidUser = data?.current_plan === "pro" || data?.current_plan === "buster";
    const creditsRemaining = data?.scan_credits_remaining ?? 0;
    const plan = data?.current_plan === "pro"
        ? "Professional"
        : isBusterActive
        ? `Buster (${creditsRemaining}/10)`
        : isBusterAudited
        ? "Audited"
        : "Free";

    return (
        <div className={`relative flex ${isInProgress ? 'h-[88px]' : 'h-14'}`}>
            <div className="fixed flex-1 left-0 top-0 w-full h-14 flex items-center px-4 border-b z-20 border-border/60 bg-background/80 backdrop-blur-sm">
                <div className="flex-1 sm:px-4 p-0 flex justify-between items-center">
                    <div className="flex flex-row items-center gap-4">
                        <SlidingSidebar />
                        <Link href="/dashboard">
                            <div className="flex flex-row items-center space-x-2">
                                <Logo className="h-6 w-auto" />
                                <span className="font-medium text-lg text-foreground md:block hidden">GhostSweep</span>
                            </div>
                        </Link>
                    </div>
                    {/* Plan Badge */}
                    <div className="hidden sm:block">
                        {status === 'pending' ? (
                            <div className="h-7 w-20 bg-neutral-200 rounded-full animate-pulse" />
                        ) : (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                                data?.current_plan === "pro"
                                    ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                                    : isBusterActive
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                                    : isBusterAudited
                                    ? "bg-foreground/12 text-muted-foreground border border-foreground/15"
                                    : "bg-foreground/12 text-foreground/75 border border-foreground/15"
                            }`}>
                                {plan}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-row items-center space-x-4">
                        <div className="flex items-center gap-2">
                            {!isPaidUser && (
                                <Link href="/dashboard/billing?plan=monthly">
                                    <Button variant={"default"} size="sm" className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 font-medium text-xs gap-1.5 shadow-lg shadow-emerald-500/20">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Upgrade
                                    </Button>
                                </Link>
                            )}
                            
                            {/* Connect Account Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 text-xs border-foreground/20 hover:bg-foreground/5">
                                        <Plus className="h-3.5 w-3.5" />
                                        Connect
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">Connect Email Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <a href="/api/google/oauth/start">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <GmailLogo className="mr-2 h-4 w-4" />
                                            Add Gmail
                                        </DropdownMenuItem>
                                    </a>
                                    <a href="/api/microsoft/oauth">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <OutLookLogo className="mr-2 h-4 w-4" />
                                            Add Outlook
                                        </DropdownMenuItem>
                                    </a>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <Link href="/dashboard/settings">
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </Link>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-foreground/5">
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-foreground/10 flex items-center justify-center">
                                            <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">{userInitials}</span>
                                        </div>
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">{userEmail || 'User'}</p>
                                            <p className="text-xs text-muted-foreground">{plan} Plan</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <Link href="/dashboard/settings">
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem onClick={() => setOpenSupport(true)}>
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        Help & Support
                                    </DropdownMenuItem>
                                    {latestReport && (
                                        <DropdownMenuItem
                                            onClick={downloadLatestReport}
                                            className="cursor-pointer text-cyan-600 dark:text-cyan-400 focus:text-cyan-700 dark:focus:text-cyan-300"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Download Last Report
                                            {latestReport.generatedAt && (
                                                <span className="ml-auto text-xs opacity-60">
                                                    {new Date(latestReport.generatedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={requestReport}
                                        disabled={isReportGenerating}
                                        className="cursor-pointer"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        {isReportGenerating ? "Generating report…" : latestReport ? "Regenerate Report" : "Generate Privacy Report"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleLogout()} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <ThemeToggle />
                        <Notifications />
                    </div>
                </div>
            </div>

            {/* Sweep progress banner - shown on ALL pages when sweep is in progress */}
            {isInProgress && latestSweep && (
                <div className="fixed left-0 top-14 w-full z-10">
                    <div className="mx-auto flex items-center justify-between gap-3 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm px-4 py-2.5 text-xs text-cyan-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Loader2 className="h-4 w-4 animate-spin text-cyan-600 dark:text-cyan-400" />
                                <div className="absolute inset-0 h-4 w-4 animate-ping opacity-20 rounded-full bg-cyan-400" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                <span className="font-medium text-foreground">
                                    {latestSweep.phaseLabel ?? "Scanning your inbox…"}
                                </span>
                                <div className="flex items-center gap-2 text-cyan-700/70 dark:text-cyan-300/70">
                                    {typeof latestSweep.messagesProcessed === "number" && (
                                        <span>• {latestSweep.messagesProcessed.toLocaleString()} messages</span>
                                    )}
                                    {elapsedMinutes > 0 && (
                                        <span>• {elapsedMinutes} min elapsed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {typeof latestSweep.progress === "number" && (
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-cyan-900/50">
                                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300" style={{ width: `${latestSweep.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300">{latestSweep.progress}%</span>
                                </div>
                            )}
                            {pathname !== "/dashboard" && (
                                <Link href="/dashboard">
                                    <Button size="sm" variant="ghost" className="h-7 text-[11px] text-cyan-800 dark:text-cyan-100 hover:bg-foreground/10 border border-cyan-500/30">
                                        View details
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <SupportModal open={openSupport} onOpenChangeAction={setOpenSupport} />
        </div>
    )
}