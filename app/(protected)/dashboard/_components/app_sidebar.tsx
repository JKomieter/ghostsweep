"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SlidingSidebar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    const isSelected = (path: string) => {
        return path === pathname
    }

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
        <>
            {/* Trigger Button (put this in your header/nav) */}
            <Button variant="outline" size={"icon"} onClick={() => setOpen(true)}>
                <Menu />
            </Button>

            {/* Desktop: you can hide this or style differently */}
            {/* <button className="hidden md:inline-flex">…</button> */}

            {/* BACKDROP */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setOpen(false)}
            />

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-999 flex w-72 max-w-full flex-col 
                bg-[#0b0b0b] backdrop-blur-xl border-r border-white/10 shadow-2xl
                transition-transform duration-200 h-screen
                ${open ? "translate-x-0" : "-translate-x-full"}`}
                    >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <span className="text-sm font-semibold text-white">GhostSweep</span>
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-full border border-white/10 p-1 text-white/70 hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex flex-col flex-1 gap-1 p-4 text-sm bg-[#0b0b0b]">
                    <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className={cn(
                            "rounded-md px-3 py-2 text-sm transition-colors",
                            isSelected("/dashboard")
                                ? "bg-white/10 text-white border-l-2 border-primary"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/dashboard/user_services"
                        onClick={() => setOpen(false)}
                        className={cn(
                            "rounded-md px-3 py-2 text-sm transition-colors",
                            isSelected("/dashboard/user_services")
                                ? "bg-white/10 text-white border-l-2 border-primary"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        Services
                    </Link>

                    {/* <Link
                        href="/breaches"
                        onClick={() => setOpen(false)}
                        className={cn(
                            "rounded-md px-3 py-2 text-sm transition-colors",
                            isSelected("/dashboard/breaches")
                                ? "bg-white/10 text-white border-l-2 border-primary"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        Breaches
                    </Link> */}

                    <Link
                        href="/dashboard/deletion_requests"
                        onClick={() => setOpen(false)}
                        className={cn(
                            "rounded-md px-3 py-2 text-sm transition-colors",
                            isSelected("/dashboard/deletion_requests")
                                ? "bg-white/10 text-white border-l-2 border-primary"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        Deletion Requests
                    </Link>

                    <Link
                        href="/dashboard/footprint_map"
                        onClick={() => setOpen(false)}
                        className={cn(
                            "rounded-md px-3 py-2 text-sm transition-colors",
                            isSelected("/dashboard/footprint_map")
                                ? "bg-white/10 text-white border-l-2 border-primary"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        Footprint Map
                    </Link>

                    <Link
                        href="/dashboard/tools/data_removal"
                        onClick={() => setOpen(false)}
                        className={cn(
                            "rounded-md px-3 py-2 text-sm transition-colors",
                            isSelected("/dashboard/tools/data_removal")
                                ? "bg-white/10 text-white border-l-2 border-primary"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        Email Templates
                    </Link>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full rounded-md px-3 py-2 text-left text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        >
                            Log out
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
}