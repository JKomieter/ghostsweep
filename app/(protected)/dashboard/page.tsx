"use client"
import Breaches from "./_components/breaches-table";
import DashboardTitle from "./_components/dashboard-title";
import News from "./_components/news";
import SummaryCards from "./_components/summary-cards";

export default function DashboardPage() {
    return (
        <div className="p-4 md:p-8">
            <DashboardTitle />
            <SummaryCards />
            <div className="grid sm:grid-cols-3 gap-4 grid-cols-1 mt-8">
                <Breaches />
                <News />
            </div>
        </div>
    )
}