"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"; // remove if you don't have this
import { formatDate } from "@/utils/format-date"; // or your own formatter

type NotificationType =
    | "new_breach_detected"
    | "new_account_detected"
    | "privacy_status_changed"
    | "gmail_disconnected"
    | "plan_upgraded"
    | "plan_downgraded";

type Notification = {
    id: string;
    user_id: string;
    type: NotificationType | string;
    title: string | null;
    message: string | null;
    metadata: Record<string, string> | null;
    read: boolean;
    created_at: string;
};

type NotificationsResponse = {
    notifications: Notification[];
};

export default function NotificationDropdown() {
    const queryClient = useQueryClient()

    const { data, isLoading, isError } = useQuery<NotificationsResponse>({
        queryKey: ["notifications", "latest"],
        queryFn: async () => {
            const res = await fetch("/api/notifications?limit=10");
            if (!res.ok) throw new Error("Failed to fetch notifications");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const handleOpen = async () => {
        console.log("Marking read")
        await fetch("/api/notifications/mark-read", { method: "POST" });
        queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] });
    };

    const notifications = data?.notifications ?? [];
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label="Open notifications"
                    onClick={handleOpen}
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    )}

                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-semibold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-80 max-h-96 overflow-y-auto border border-white/10 bg-[#050505]/95 backdrop-blur-md"
            >
                <DropdownMenuLabel className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                        <span className="text-[10px] text-muted-foreground/70">
                            {notifications.length} recent
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                {isError && (
                    <div className="px-3 py-6 text-center text-xs text-red-400">
                        Failed to load notifications
                    </div>
                )}

                {!isError && isLoading && (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        Loading notifications…
                    </div>
                )}

                {!isError && !isLoading && notifications.length === 0 && (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        You’re all caught up. No new notifications.
                    </div>
                )}

                {!isError &&
                    !isLoading &&
                    notifications.map((n) => (
                        <DropdownMenuItem
                            key={n.id}
                            className={cn(
                                "flex flex-col items-start gap-1 px-3 py-2.5 focus:bg-white/5",
                                !n.read && "bg-white/3"
                            )}
                            // later you can onClick → open details / mark as read
                            onSelect={(e) => e.preventDefault()}
                        >
                            <div className="flex w-full items-start justify-between gap-2">
                                <div className="text-xs font-medium text-white">
                                    {n.title ?? prettyTypeLabel(n.type)}
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {formatDate(n.created_at)}
                                </span>
                            </div>

                            {n.message && (
                                <p className="line-clamp-2 text-[11px] text-muted-foreground">
                                    {n.message}
                                </p>
                            )}

                            {/* Small type pill */}
                            <div className="mt-1 flex items-center gap-2">
                                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {prettyTypeLabel(n.type)}
                                </span>
                                {!n.read && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Optional helper to prettify type → label
function prettyTypeLabel(type: string): string {
    switch (type) {
        case "new_breach_detected":
            return "New breach detected";
        case "new_account_detected":
            return "New account detected";
        case "privacy_status_changed":
            return "Privacy request updated";
        case "gmail_disconnected":
            return "Gmail disconnected";
        case "plan_upgraded":
            return "Plan upgraded";
        case "plan_downgraded":
            return "Plan downgraded";
        default:
            return type.replace(/_/g, " ");
    }
}