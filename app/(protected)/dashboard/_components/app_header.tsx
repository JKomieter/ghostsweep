"use client"

import { Button } from "@/components/ui/button";
import { Logo } from "@/svgs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Profile from "./profile";
import { useState, useEffect, useMemo } from "react";
import ConnectEmailModal from "./connected_email_account";
import SubscriptionModal from "./subscription";
import PrivacyToolsModal from "./privacy_modal";
import Link from "next/link";
import { SupportModal } from "./support-modal";
import { toast } from "sonner";
import SlidingSidebar from "./app_sidebar";
import Notifications from "./notifications";
import { usePathname } from "next/navigation";

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
    const [openProfile, setOpenProfile] = useState(false)
    const [openConnectEmail, setOpenConnectEmail] = useState(false)
    const [openSubscription, setOpenSubscription] = useState(false)
    const [openPrivacy, setOpenPrivacy] = useState(false)
    const [openSupport, setOpenSupport] = useState(false)
    const [currentTime, setCurrentTime] = useState(() => Date.now())

    const pathname = usePathname();

    const { data, status } = useQuery({
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

    const plan = data?.current_plan === "pro" ? "Professional" : "Free"

    return (
        <div className="h-14 relative flex">
            <div className="fixed flex-1 left-0 top-0 w-full h-14 flex items-center px-4 border-b z-10 border-border/60 bg-background/80 backdrop-blur-sm">
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
                                    ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30" 
                                    : "bg-gray-900 text-gray-300 border border-gray-700"
                            }`}>
                                {plan}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-row items-center space-x-4">
                        <div>
                            {data?.current_plan !== "pro" && (
                                <Link href="/dashboard/billing">
                                    <Button variant={"default"} size="sm" className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-semibold animate-pulse">
                                        Upgrade
                                    </Button>
                                </Link>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant="ghost" size="icon">
                                        <Settings />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setOpenProfile(true)}>
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setOpenConnectEmail(true)}>
                                        Connect email accounts
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setOpenSubscription(true)}>
                                        Subscription & Billing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setOpenPrivacy(true)}>
                                        Privacy Tools
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setOpenSupport(true)}>
                                        Support
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleLogout()}>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Notifications />
                    </div>
                </div>
            </div>

            {/* Sweep progress banner shown outside /dashboard */}
            {pathname !== "/dashboard" && isInProgress && latestSweep && (
                <div className="fixed left-0 top-14 w-full z-10">
                    <div className="mx-auto flex items-center justify-between gap-3 border-t border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-100">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="font-medium">
                                {latestSweep.phaseLabel ?? "Scanning your inbox…"}
                            </span>
                            {typeof latestSweep.messagesProcessed === "number" && (
                                <span className="text-cyan-200/80">• {latestSweep.messagesProcessed.toLocaleString()} msgs</span>
                            )}
                            {elapsedMinutes > 0 && (
                                <span className="text-cyan-200/80">• {elapsedMinutes} min</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {typeof latestSweep.progress === "number" && (
                                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-cyan-900/50 sm:block">
                                    <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${latestSweep.progress}%` }} />
                                </div>
                            )}
                            <Link href="/dashboard">
                                <Button size="sm" variant="ghost" className="h-7 text-[11px] text-cyan-100 hover:bg-white/10">
                                    View details
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            <Profile open={openProfile} onOpenChangeAction={setOpenProfile} />
            <ConnectEmailModal open={openConnectEmail} onOpenChangeAction={setOpenConnectEmail} />
            <SubscriptionModal open={openSubscription} onOpenChangeAction={setOpenSubscription} />
            <PrivacyToolsModal open={openPrivacy} onOpenChangeAction={setOpenPrivacy} />
            <SupportModal open={openSupport} onOpenChangeAction={setOpenSupport} />
        </div>
    )
}