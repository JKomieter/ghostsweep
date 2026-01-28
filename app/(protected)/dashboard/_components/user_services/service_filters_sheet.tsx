"use client"

import React, { Dispatch, SetStateAction } from "react"

import { Category } from "@/types"
import { GmailLogo, OutLookLogo } from "@/svgs"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Keep filter types in sync with service_table.tsx
export type BreachFilter = "all" | "breached" | "unbreached"
export type ActivityFilter = "all" | "active" | "inactive"
export type HasDeletionFilter = "all" | "yes" | "no"
export type EmailFilter = "all" | string
export type WhitelistFilter = "all" | "whitelisted" | "not_whitelisted"

const categories: Category[] = [
    "Social Media",
    "Streaming & Entertainment",
    "Shopping & E-commerce",
    "Financial & Payments",
    "Productivity & Work",
    "Travel & Transportation",
    "Food & Delivery",
    "Gaming",
    "Health & Fitness",
    "News & Media",
    "Email & Communication",
    "Other",
]

interface ServiceFiltersSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void

    category: Category | undefined | "all"
    setCategory: Dispatch<SetStateAction<Category | undefined | "all">>

    breachedFilter: BreachFilter
    setBreachedFilter: Dispatch<SetStateAction<BreachFilter>>

    activityFilter: ActivityFilter
    setActivityFilter: Dispatch<SetStateAction<ActivityFilter>>

    minEmails: number | undefined
    setMinEmails: Dispatch<SetStateAction<number | undefined>>

    hasDeletionRequest: HasDeletionFilter
    setHasDeletionRequest: Dispatch<SetStateAction<HasDeletionFilter>>

    emailFilter: EmailFilter
    setEmailFilter: Dispatch<SetStateAction<EmailFilter>>

    whitelistFilter: WhitelistFilter
    setWhitelistFilter: Dispatch<SetStateAction<WhitelistFilter>>

    gmailAccounts: Array<{ id: string; gmail_address: string; created_at: string }>
    microsoftAccounts: Array<{ id: string; outlook_address: string; created_at: string }>

    resetFilters: () => void
}

export function ServiceFiltersSheet(props: ServiceFiltersSheetProps) {
    const {
        open,
        onOpenChange,
        category,
        setCategory,
        breachedFilter,
        setBreachedFilter,
        activityFilter,
        setActivityFilter,
        minEmails,
        setMinEmails,
        hasDeletionRequest,
        setHasDeletionRequest,
        emailFilter,
        setEmailFilter,
        whitelistFilter,
        setWhitelistFilter,
        gmailAccounts,
        microsoftAccounts,
        resetFilters,
    } = props

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-[#050505] border-white/10 text-white w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription className="text-white/60 text-xs">
                        Narrow down accounts before selecting them for bulk deletion.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4 px-4">
                    {/* Category */}
                    <div className="space-y-2">
                        <div className="text-xs text-white/70">Category</div>
                        <Select
                            value={(category ?? "all") as string}
                            onValueChange={(v) => {
                                setCategory((v === "all" ? "all" : (v as Category)))
                            }}
                        >
                            <SelectTrigger className="bg-[#050505] border-white/15">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Breach */}
                    <div className="space-y-2">
                        <div className="text-xs text-white/70">Breach</div>
                        <Select
                            value={breachedFilter}
                            onValueChange={(v) => {
                                setBreachedFilter(v as BreachFilter)
                            }}
                        >
                            <SelectTrigger className="bg-[#050505] border-white/15">
                                <SelectValue placeholder="All services" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All services</SelectItem>
                                    <SelectItem value="breached">Breached only</SelectItem>
                                    <SelectItem value="unbreached">Not breached</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Activity */}
                    <div className="space-y-2">
                        <div className="text-xs text-white/70">Activity</div>
                        <Select
                            value={activityFilter}
                            onValueChange={(v) => {
                                setActivityFilter(v as ActivityFilter)
                            }}
                        >
                            <SelectTrigger className="bg-[#050505] border-white/15">
                                <SelectValue placeholder="Any activity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Any activity</SelectItem>
                                    <SelectItem value="active">Active (recent)</SelectItem>
                                    <SelectItem value="inactive">Inactive (old)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Min emails */}
                    <div className="space-y-2">
                        <div className="text-xs text-white/70">Minimum emails</div>
                        <Select
                            value={typeof minEmails === "number" ? String(minEmails) : "any"}
                            onValueChange={(v) => {
                                setMinEmails(v === "any" ? undefined : Number(v))
                            }}
                        >
                            <SelectTrigger className="bg-[#050505] border-white/15">
                                <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="any">Any</SelectItem>
                                    <SelectItem value="1">1+</SelectItem>
                                    <SelectItem value="5">5+</SelectItem>
                                    <SelectItem value="10">10+</SelectItem>
                                    <SelectItem value="50">50+</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Has deletion request */}
                    <div className="space-y-2">
                        <div className="text-xs text-white/70">Deletion request</div>
                        <Select
                            value={hasDeletionRequest}
                            onValueChange={(v) => {
                                setHasDeletionRequest(v as HasDeletionFilter)
                            }}
                        >
                            <SelectTrigger className="bg-[#050505] border-white/15">
                                <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Any</SelectItem>
                                    <SelectItem value="yes">Has request</SelectItem>
                                    <SelectItem value="no">No request</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Email account filter */}
                    {(gmailAccounts.length > 0 || microsoftAccounts.length > 0) && (
                        <div className="space-y-2">
                            <div className="text-xs text-white/70">Email account</div>
                            <Select
                                value={emailFilter}
                                onValueChange={(v) => {
                                    setEmailFilter(v as EmailFilter)
                                }}
                            >
                                <SelectTrigger className="bg-[#050505] border-white/15">
                                    <SelectValue placeholder="All accounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="all">All accounts</SelectItem>
                                        {gmailAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.gmail_address}>
                                                <span className="flex items-center gap-2">
                                                    <GmailLogo className="h-3.5 w-3.5" />
                                                    {account.gmail_address}
                                                </span>
                                            </SelectItem>
                                        ))}
                                        {microsoftAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.outlook_address}>
                                                <span className="flex items-center gap-2">
                                                    <OutLookLogo className="h-3.5 w-3.5" />
                                                    {account.outlook_address}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Whitelisted status */}
                    <div className="space-y-2">
                        <div className="text-xs text-white/70">Whitelisted status</div>
                        <Select
                            value={whitelistFilter}
                            onValueChange={(v) => {
                                setWhitelistFilter(v as WhitelistFilter)
                            }}
                        >
                            <SelectTrigger className="bg-[#050505] border-white/15">
                                <SelectValue placeholder="All services" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All services</SelectItem>
                                    <SelectItem value="whitelisted">Whitelisted only</SelectItem>
                                    <SelectItem value="not_whitelisted">Not whitelisted</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <Button
                            variant="outline"
                            className="border-white/15 bg-[#050505] flex-1"
                            onClick={resetFilters}
                        >
                            Reset
                        </Button>
                        <Button
                            className="bg-primary text-black hover:bg-primary/80 flex-1"
                            onClick={() => onOpenChange(false)}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
