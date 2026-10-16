"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { PaywallProvider } from "./upgrade_paywall"

const queryClient = new QueryClient()

export function DashboardProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PaywallProvider>
        {children}
      </PaywallProvider>
    </QueryClientProvider>
  )
}
