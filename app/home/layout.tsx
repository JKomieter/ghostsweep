"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Header from "./_components/header"


const queryClient = new QueryClient()

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-background text-foreground relative">
                <Header />
                {children}
            </div>
        </QueryClientProvider>
    )
}