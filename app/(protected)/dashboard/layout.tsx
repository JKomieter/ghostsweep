"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Header from "./_components/app_header"


const queryClient = new QueryClient()

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
                <main className="bg-background relative">
                    <Header />
                    {children}
                </main>
        </QueryClientProvider>
    )
}