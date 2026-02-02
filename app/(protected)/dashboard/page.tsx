"use client"
import Breaches from "./_components/breaches_table";
import DashboardPageTitle from "./_components/dashboard_page_title";
import DashboardUserServicesTable from "./_components/dashboard_user_services_table";
import FreemiumUpgradeTeaser from "./_components/freemium_upgrade_teaser";
import News from "./_components/news";
import SummaryCards from "./_components/summary-cards";

export default function DashboardPage() {
    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-6xl mx-auto space-y-8">
                <DashboardPageTitle />
                <FreemiumUpgradeTeaser />
                <SummaryCards />
                <DashboardUserServicesTable />
                <div className="grid sm:grid-cols-3 gap-6 grid-cols-1">
                    <Breaches />
                    <News />
                </div>
            </div>
        </div>
    )
}