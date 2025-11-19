import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/utils/format-date";
import { useQuery } from "@tanstack/react-query"
import { ShieldAlert, Calendar, Database, EyeOff } from "lucide-react";

interface UserBreach {
    id: string;
    user_id: string;
    breach_date: string | null;
    domain: string | null;
    pwn_count: number;
    data_classes: string[] | null;
    is_sensitive: boolean | null;
    raw: Record<string, unknown> | null;
}

export default function Breaches() {

    const { data, status } = useQuery({
        queryKey: ['breaches'],
        queryFn: async (): Promise<{ breaches: UserBreach[], total: number }> => {
            const res = await fetch('/api/breaches')
            if (!res.ok) {
                throw new Error('Network response was not ok')
            }
            const { breaches, total } = await res.json()
            return { breaches, total }
        },
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

    const isFree = plan?.current_plan === "free"
    const visibleCount = data?.breaches?.length ?? 0
    const totalCount = data?.total ?? visibleCount
    const hasHiddenBreaches = isFree && totalCount > visibleCount


    return (
        <div className="rounded-xl border border-white/10 bg-[#050505] p-5 min-h-[300px] sm:col-span-2 col-span-1 overflow-y-auto overflow-x-auto flex flex-col">
            <div className="mb-4">
                <h2 className="font-medium">
                    Recent Breaches
                </h2>
                {hasHiddenBreaches && (
                    <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                        <p className="text-sm text-blue-300">
                            We found <strong>{totalCount}</strong> breaches linked to your data.
                            You&apos;re seeing the first <strong>{visibleCount}</strong>.
                            <button
                                className="text-blue-400 underline underline-offset-2 ml-1"
                            >
                                Upgrade to Pro
                            </button>{" "}
                            to unlock all breach details.
                        </p>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4 flex-1">
                {status === "pending" && (
                    <div className="flex flex-1 items-center justify-center gap-2">
                        <Spinner className="text-primary" />
                        <span>Loading breaches...</span>
                    </div>
                )}
                {status === "error" && (
                    <div className="text-red-500 flex-1 flex items-center justify-center">
                        Error loading breaches.
                    </div>
                )}
                {status === "success" && data?.breaches.length === 0 ? (
                    <div className="text-gray-400 flex-1 flex items-center justify-center">
                        No breaches found
                    </div>
                ) : (
                    data?.breaches.map((breach) => (
                        <div
                            key={breach.id}
                            className="border border-white/10 rounded-xl p-4 bg-[#131313] flex flex-col gap-4"
                        >
                            {/* Top Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                    <h3 className="font-semibold text-base">
                                        {breach.domain || "Unknown Domain"}
                                    </h3>
                                </div>

                                <span className="inline-flex items-center rounded-full bg-red-500/10 text-red-400 text-xs px-2 py-1">
                                    Breached
                                </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-sm text-gray-300">

                                {/* Breach Date */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <p>
                                        <span className="text-gray-500">Breach Date:</span>{" "}
                                        {formatDate(breach.breach_date) || "N/A"}
                                    </p>
                                </div>

                                {/* Pwn Count */}
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-gray-500" />
                                    <p>
                                        <span className="text-gray-500">Accounts Exposed:</span>{" "}
                                        {breach.pwn_count?.toLocaleString() ?? "N/A"}
                                    </p>
                                </div>

                                {/* Data Classes */}
                                <div className="flex items-start gap-2">
                                    <EyeOff className="w-4 h-4 text-gray-500 mt-1" />
                                    <p className="flex flex-wrap gap-1">
                                        <span className="text-gray-500 mr-1">Data Exposed:</span>
                                        {breach.data_classes ? (
                                            breach.data_classes.map((d: string) => (
                                                <span
                                                    key={d}
                                                    className="bg-white/5 text-gray-300 text-xs px-2 py-1 rounded-md"
                                                >
                                                    {d}
                                                </span>
                                            ))
                                        ) : (
                                            <span>N/A</span>
                                        )}
                                    </p>
                                </div>

                                {/* Sensitive */}
                                {breach.is_sensitive !== null && (
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-gray-500" />
                                        <p>
                                            <span className="text-gray-500">Sensitive:</span>{" "}
                                            {breach.is_sensitive ? "Yes" : "No"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}