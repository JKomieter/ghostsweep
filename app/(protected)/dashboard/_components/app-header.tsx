import { Button } from "@/components/ui/button";
import { Logo } from "@/svgs";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Profile from "./profile";
import { useState } from "react";
import ConnectEmailModal from "./connected-email-account";
import SubscriptionModal from "./subscription";
import PrivacyToolsModal from "./privacy-modal";
import Link from "next/link";
import { SupportModal } from "./support-modal";
import { toast } from "sonner";
import SlidingSidebar from "./app-sidebar";
import Notifications from "./notifications";


export default function Header() {
    const [openProfile, setOpenProfile] = useState(false)
    const [openConnectEmail, setOpenConnectEmail] = useState(false)
    const [openSubscription, setOpenSubscription] = useState(false)
    const [openPrivacy, setOpenPrivacy] = useState(false)
    const [openSupport, setOpenSupport] = useState(false)

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
                    <div>
                        {status === 'pending' ? (
                            <span className="h-7 w-11 bg-neutral-quaternary"></span>
                        ) : (
                            <span className={`px-3 py-1 rounded-full ${data?.current_plan === "free" ? "bg-gray-800" : "bg-primary/10"} text-primary text-sm font-medium uppercase`}>{data?.current_plan}</span>
                        )}
                    </div>

                    <div className="flex flex-row items-center space-x-4">
                        <div>
                            {data?.current_plan !== "pro" && (
                                <Link href="/dashboard/billing">
                                    <Button variant={"ghost"} size="sm">Upgrade</Button>
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
            <Profile open={openProfile} onOpenChangeAction={setOpenProfile} />
            <ConnectEmailModal open={openConnectEmail} onOpenChangeAction={setOpenConnectEmail} />
            <SubscriptionModal open={openSubscription} onOpenChangeAction={setOpenSubscription} />
            <PrivacyToolsModal open={openPrivacy} onOpenChangeAction={setOpenPrivacy} />
            <SupportModal open={openSupport} onOpenChangeAction={setOpenSupport} />
        </div>
    )
}