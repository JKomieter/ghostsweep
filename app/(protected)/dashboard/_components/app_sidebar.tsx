"use client";

import Link from "next/link";
import { logout } from "@/utils/client-logout";
import { Menu, X, LayoutDashboard, LogOut, Fingerprint, Users, Repeat, Mail, Wallet, Settings, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useGetUser from "@/hooks/use-get-user";

const navGroups = [
    {
        label: null,
        items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
        label: "Findings",
        items: [
            { label: "Accounts", href: "/dashboard/accounts", icon: Users },
            { label: "Identity Shadow", href: "/dashboard/identity-shadow", icon: Fingerprint },
            { label: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat },
            { label: "Newsletters", href: "/dashboard/newsletters", icon: Mail },
            { label: "Value Recovery", href: "/dashboard/value-recovery", icon: Wallet },
        ],
    },
    {
        label: "Account",
        items: [
            { label: "Settings", href: "/dashboard/settings", icon: Settings },
            { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
        ],
    },
];

export default function SlidingSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const {data: user} = useGetUser();

    const isSelected = (path: string) =>
        path === "/dashboard" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out. Please try again.", error);
            toast.error("Failed to log out. Please try again.");
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <Button variant="outline" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
                <Menu className="h-4 w-4" />
            </Button>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-full flex-col 
                bg-background border-r border-foreground/10
                transition-transform duration-200 h-screen
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-foreground/10">
                    <span className="text-sm font-semibold text-foreground">GhostSweep</span>
                    <button
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                        className="rounded-md border border-foreground/10 p-1.5 text-foreground/70 hover:bg-foreground/[0.06] transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* User Info - New Section */}
                <div className="px-4 py-3 border-b border-foreground/10">
                    <p className="text-xs text-foreground/50">Signed in as</p>
                    <p className="font-mono text-xs text-foreground truncate">{user?.email}</p>
                </div>

                {/* Nav */}
                <nav className="flex flex-col flex-1 p-3">
                    <div className="space-y-5">
                        {navGroups.map((group) => (
                            <div key={group.label ?? "main"} className="space-y-0.5">
                                {group.label && (
                                    <p className="px-3 pb-1.5 text-xs text-foreground/50">{group.label}</p>
                                )}
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isSelected(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            aria-current={active ? "page" : undefined}
                                            className={cn(
                                                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                                active
                                                    ? "bg-foreground/[0.06] font-medium text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
                                                    : "text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground"
                                            )}
                                        >
                                            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-foreground/50")} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Logout - Bottom */}
                    <div className="mt-auto pt-4 border-t border-foreground/10">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground transition-colors"
                        >
                            <LogOut className="h-4 w-4 shrink-0 text-foreground/50" />
                            <span>Log out</span>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
}