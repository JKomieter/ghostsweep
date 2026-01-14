"use client";

import Link from "next/link";
import { Menu, X, LayoutDashboard, Zap, FileText, Shield, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useGetUser from "@/hooks/use-get-user";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "My Services",
        href: "/dashboard/user_services",
        icon: Zap,
    },
];

const dataItems = [
    {
        label: "Digital Shadow",
        href: "/dashboard/digital_shadow",
        icon: Shield,
    },
    {
        label: "Deletion Requests",
        href: "/dashboard/deletion_requests",
        icon: FileText,
    },
    {
        label: "Opt-Out Progress",
        href: "/dashboard/opt_out_progress",
        icon: CheckCircle2,
    },
];

export default function SlidingSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const {data: user} = useGetUser();

    const isSelected = (path: string) => {
        return path === pathname;
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/signout", {
                method: "POST",
            });
            window.location.href = "/login";
        } catch (error) {
            console.error("Failed to log out. Please try again.", error);
            toast.error("Failed to log out. Please try again.");
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
                <Menu className="h-4 w-4" />
            </Button>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-full flex-col 
                bg-[#0b0b0b] border-r border-white/10
                transition-transform duration-200 h-screen
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <span className="text-sm font-semibold text-white">GhostSweep</span>
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-lg border border-white/10 p-1.5 text-white/70 hover:bg-white/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* User Info - New Section */}
                <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs text-white/50">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                </div>

                {/* Nav */}
                <nav className="flex flex-col flex-1 p-3 space-y-1">
                    {/* Main Section */}
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isSelected(item.href)
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="my-2 h-px bg-white/10" />

                    {/* Data Section */}
                    <div className="space-y-1">
                        <h3 className="px-3 py-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                            Your Data
                        </h3>
                        {dataItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isSelected(item.href)
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Logout - Bottom */}
                    <div className="mt-auto pt-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Log out</span>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
}