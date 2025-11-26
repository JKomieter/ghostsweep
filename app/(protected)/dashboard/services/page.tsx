"use client"
import ServiceTable from "../_components/services/service-table";


export default function ServicePage() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-8 md:py-8">
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Services</h1>
                    <p className="text-sm text-white/60">
                        All companies GhostSweep found linked to your email, with risk and privacy status.
                    </p>
                </div>

                {/* Optional helper text / future filters */}
                <div className="text-xs text-white/40 sm:text-right">
                    View, prioritize, and take action on your accounts.
                </div>
            </div>

            {/* Table container */}
            <div className="rounded-xl border border-white/10 bg-[#050505] p-4 md:p-5">
                <ServiceTable />
            </div>
        </div>
    );
}