"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Header from "./_components/app-header"

const queryClient = new QueryClient()

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-background relative">
                <Header />
                {children}
            </div>
        </QueryClientProvider>
    )
}