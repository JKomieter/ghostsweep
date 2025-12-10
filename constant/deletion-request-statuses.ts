import { DeletionStatus } from "@/types";


export const statusMap: Record<
    DeletionStatus,
    { label: string; className: string }
> = {
    drafted: {
        label: "Drafted",
        className: "bg-zinc-500/10 text-zinc-300",
    },
    sent: {
        label: "Sent",
        className: "bg-blue-500/10 text-blue-300",
    },
    received: {
        label: "Reply Received",
        className: "bg-indigo-500/10 text-indigo-300",
    },
    needs_verification: {
        label: "Needs Verification",
        className: "bg-yellow-500/10 text-yellow-300",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-purple-500/10 text-purple-300",
    },
    completed: {
        label: "Completed",
        className: "bg-emerald-500/10 text-emerald-300",
    },
    failed: {
        label: "Failed",
        className: "bg-red-500/10 text-red-300",
    },
    expired: {
        label: "Expired",
        className: "bg-orange-500/10 text-orange-300",
    },
};