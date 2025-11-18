"use client"
import ServiceTable from "./_components/service-table";
import SummaryCards from "./_components/summary-cards";
import SweepCard from "./_components/sweep-card";


export default function DashboardPage() {
    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <h1 className="text-2xl font-bold mb-4">Your privacy dashboard</h1>
            <div className="grid md:grid-cols-4 gap-4 grid-cols-1">
                <SummaryCards />
                <SweepCard />
            </div>
            <ServiceTable />
        </div>
    )
}