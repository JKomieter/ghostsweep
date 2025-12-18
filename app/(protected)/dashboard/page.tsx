"use client"
import Breaches from "./_components/breaches_table";
import DashboardPageTitle from "./_components/dashboard_page_title";
import DashboardUserServicesTable from "./_components/dashboard_user_services_table";
import News from "./_components/news";
import SummaryCards from "./_components/summary-cards";

export default function DashboardPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <DashboardPageTitle />
            <SummaryCards />
            <DashboardUserServicesTable />
            <div className="grid sm:grid-cols-3 gap-4 grid-cols-1">
                <Breaches />
                <News />
            </div>
        </div>
    )
}