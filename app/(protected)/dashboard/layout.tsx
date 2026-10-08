import type { Metadata } from "next"
import Header from "./_components/app_header"
import StartScanOnboardingDialog from "./_components/start_scan_onboarding_dialog"
import { DashboardProvider } from "./_components/dashboard-provider"
import PendingPlanRedirect from "./_components/pending-plan-redirect"

export const metadata: Metadata = {
    title: "Dashboard | GhostSweep Account Management",
    description: "Manage your digital footprint. View discovered accounts, monitor data breaches, and control your online presence.",
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: "Dashboard | GhostSweep",
        description: "Manage your account security and digital footprint.",
        url: "https://ghostsweep.com/dashboard",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/dashboard",
    },
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardProvider>
            <main className="bg-background relative">
                <PendingPlanRedirect />
                <Header />
                {children}
                <StartScanOnboardingDialog />
            </main>
        </DashboardProvider>
    )
}