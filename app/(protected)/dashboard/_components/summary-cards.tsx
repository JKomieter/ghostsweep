import { formatDate } from "@/utils/format-date";
import { useQuery } from "@tanstack/react-query"

interface MetricsData {
    service_count: number;
    breach_count: number;
    last_scan_date: string | null;
}

export default function SummaryCards() {
    const {data} = useQuery({
        queryKey: ['metrics'],
        queryFn: async (): Promise< MetricsData> => {
            const res = await fetch('/api/metrics')
            if (!res.ok) {
                throw new Error('Network response was not ok')
            }
            return res.json()
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    return (
        <div className="md:col-span-3 col-span-1 grid sm:grid-cols-3 grid-cols-1 gap-4">
            {/* Services Card */}
            <div className="rounded-xl bg-[#0f0f0f] border border-white/10 p-5 hover:border-primary/40 transition-all">
                <p className="text-sm text-white/60">Services Found</p>
                <h2 className="text-3xl font-semibold text-white mt-1">{data?.service_count}</h2>
                <p className="text-xs text-white/40 mt-2">
                    Companies holding your personal data
                </p>
            </div>
            
            {/* Breaches Card */}
            <div className="rounded-xl bg-[#0f0f0f] border border-white/10 p-5 hover:border-destructive/50 transition-all">
                <p className="text-sm text-white/60">Breaches Detected</p>
                <h2 className="text-3xl font-semibold text-destructive mt-1">
                    {data?.breach_count}
                </h2>
                <p className="text-xs text-white/40 mt-2">
                    Found via known data leaks
                </p>
            </div>

            {/* Last Sweep Card */}
            <div className="rounded-xl bg-[#0f0f0f] border border-white/10 p-5 hover:border-primary/40 transition-all">
                <p className="text-sm text-white/60">Last Sweep</p>
                <h2 className="text-2xl font-semibold text-white mt-1">
                    {data?.last_scan_date
                        ? formatDate(data.last_scan_date)
                        : 'Never'}
                </h2>
                <p className="text-xs text-white/40 mt-2">
                    Keep your data fresh by sweeping regularly
                </p>
            </div>
        </div>
    )
}