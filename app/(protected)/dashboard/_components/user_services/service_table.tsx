"use client"

import React, { Dispatch, SetStateAction, useMemo, useState } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    VisibilityState,
    RowSelectionState,
} from "@tanstack/react-table"
import { RefreshCw, Lock, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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

import { Category, DeletionRequest, DeletionStatus, Service, UserService } from "@/types"
import { formatDate } from "@/utils/format_date"
import { calcPriorityScore, priorityLabel } from "@/utils/priority_score"
import { UserServicesQueryResult } from "@/queryTypes"

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

type TableMeta = {
    onView: (userServiceId: string | undefined) => void
    gated?: boolean
}

type BreachFilter = "all" | "breached" | "unbreached"
type ActivityFilter = "all" | "active" | "inactive"
type HasDeletionFilter = "all" | "yes" | "no"

type RowType = Partial<UserService> & {
    service: Service
    deletion_requests?: DeletionRequest[] | null // ✅ FIX: array (or null/undefined)
}

const PAGE_SIZE = 20

export const columns: ColumnDef<RowType>[] = [
    {
        id: "select",
        header: ({ table }) => {
            const gated = (table.options.meta as TableMeta | undefined)?.gated
            if (gated) return null
            return (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            )
        },
        cell: ({ row, table }) => {
            const gated = (table.options.meta as TableMeta | undefined)?.gated
            if (gated) return null
            return (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "service",
        header: "Service",
        cell: ({ row, table }) => {
            const gated = (table.options.meta as TableMeta | undefined)?.gated
            const svc = row.original.service

            const name = svc?.name ?? "Unknown"
            const domain = svc?.domain ?? null
            const logoUrl = svc?.logo_url ?? null

            return (
                <div className={gated ? "blur-[6px] select-none pointer-events-none" : ""}>
                    <div className="flex items-start gap-2">
                        <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/10 bg-white/5 shrink-0">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    width={64}
                                    height={64}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : null}
                        </div>
                        <div className="flex flex-col leading-tight min-w-0">
                            <span className="font-medium truncate">{name}</span>
                            {domain ? <span className="text-xs text-muted-foreground truncate">{domain}</span> : null}
                        </div>
                    </div>
                </div>
            )
        },
    },
    {
        id: "service_category",
        header: "Category",
        accessorFn: (row) => row.service?.category,
        cell: ({ row, table }) => {
            const gated = (table.options.meta as TableMeta | undefined)?.gated
            const category = row.original.service?.category

            return (
                <span className={gated ? "blur-[6px] select-none pointer-events-none" : ""}>
                    {category || "Unknown"}
                </span>
            )
        },
    },
    {
        accessorKey: "email_count",
        header: "Activity",
        cell: ({ row, table }) => {
            const gated = (table.options.meta as TableMeta | undefined)?.gated
            const lastSeen = row.original.last_seen_at ? formatDate(row.original.last_seen_at) : "—"
            const count = row.original.email_count ?? 0

            return (
                <div className={gated ? "blur-[6px] select-none pointer-events-none text-left text-sm" : "text-left text-sm"}>
                    {lastSeen} · {count} emails
                </div>
            )
        },
    },
    {
        id: "priority",
        header: "Priority",
        cell: ({ row, table }) => {
            const gated = (table.options.meta as TableMeta | undefined)?.gated
            const score = calcPriorityScore({
                email_count: row.original.email_count,
                last_seen_at: row.original.last_seen_at,
                first_seen_at: row.original.first_seen_at,
                is_breached: row.original.service?.is_breached,
            })
            const { label, className } = priorityLabel(score)

            return (
                <div className={gated ? "blur-[6px] select-none pointer-events-none flex items-center gap-2" : "flex items-center gap-2"}>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
                        {label}
                    </span>
                    <span className="text-xs text-muted-foreground">{score}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "deletion_requests",
        header: "Deletion Request",
        cell: ({ row, table }) => {
            const gated = (table.options.meta as TableMeta | undefined)?.gated
            if (gated) {
                return <span className="text-xs text-muted-foreground blur-[6px] select-none pointer-events-none">—</span>
            }

            const requests = (row.original.deletion_requests ?? null) as
                | { id: string; status: DeletionStatus; sent_at: string | null }[]
                | null

            if (!requests || requests.length === 0) {
                return <span className="text-xs text-muted-foreground">None</span>
            }

            const pr = requests[0]

            const statusMap: Record<string, { label: string; className: string }> = {
                drafted: { label: "Drafted", className: "bg-zinc-500/10 text-zinc-300" },
                sent: { label: "Sent", className: "bg-blue-500/10 text-blue-300" },
                received: { label: "Reply Received", className: "bg-indigo-500/10 text-indigo-300" },
                needs_verification: { label: "Needs Verification", className: "bg-yellow-500/10 text-yellow-300" },
                in_progress: { label: "In Progress", className: "bg-purple-500/10 text-purple-300" },
                completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-300" },
                failed: { label: "Failed", className: "bg-red-500/10 text-red-300" },
                expired: { label: "Expired", className: "bg-orange-500/10 text-orange-300" },
            }

            const statusInfo = statusMap[pr.status] ?? statusMap.drafted

            return (
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
                    {statusInfo.label}
                </span>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMeta | undefined
            const gated = meta?.gated

            if (gated) {
                return (
                    <Link href="/dashboard/billing">
                        <Button variant="link" size="sm" className="px-0 text-muted-foreground">
                            <Lock className="h-3 w-3 mr-1" />
                            Upgrade
                        </Button>
                    </Link>
                )
            }

            return (
                <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => meta?.onView(row.original.id)}
                >
                    View
                </Button>
            )
        },
    },
]

interface ServiceTableProps {
    userServicesQueryResult: UserServicesQueryResult | undefined
    userServicesQueryResultStatus: "pending" | "error" | "success"

    query: string
    setQuery: Dispatch<SetStateAction<string>>

    category: Category | undefined | "all"
    setCategory: Dispatch<SetStateAction<Category | undefined | "all">>

    page: number
    setPage: Dispatch<SetStateAction<number>>

    breachedFilter: BreachFilter
    setBreachedFilter: Dispatch<SetStateAction<BreachFilter>>

    activityFilter: ActivityFilter
    setActivityFilter: Dispatch<SetStateAction<ActivityFilter>>

    minEmails: number | undefined
    setMinEmails: Dispatch<SetStateAction<number | undefined>>

    hasDeletionRequest: HasDeletionFilter
    setHasDeletionRequest: Dispatch<SetStateAction<HasDeletionFilter>>
}

export default function ServiceTable(props: ServiceTableProps) {
    const {
        userServicesQueryResult,
        userServicesQueryResultStatus,
        query,
        setQuery,
        category,
        setCategory,
        page,
        setPage,
        breachedFilter,
        setBreachedFilter,
        activityFilter,
        setActivityFilter,
        minEmails,
        setMinEmails,
        hasDeletionRequest,
        setHasDeletionRequest,
    } = props

    const router = useRouter()

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [bulkLoading, setBulkLoading] = useState(false)

    const isLoading = userServicesQueryResultStatus === "pending"

    const visibleCount = userServicesQueryResult?.userServices?.length ?? 0
    const totalCount = userServicesQueryResult?.total ?? visibleCount
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

    const canPrev = page > 1
    const canNext = page < totalPages

    const gated = userServicesQueryResult?.gated === true || userServicesQueryResult?.currentPlan === "free"

    const data = (gated ? [] : (userServicesQueryResult?.userServices || [])) as RowType[]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        enableRowSelection: !gated,
        state: {
            columnVisibility,
            rowSelection: gated ? {} : rowSelection,
            pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE },
        },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: gated ? undefined : setRowSelection,
        meta: {
            gated,
            onView: (userServiceId: string) => router.push(`/dashboard/user_services/${userServiceId}/details`),
        },
    })

    const selectedIds = useMemo(() => {
        if (gated) return []
        return table
            .getSelectedRowModel()
            .rows.map((r) => r.original.id)
            .filter(Boolean) as string[]
    }, [gated, table])

    const selectedCount = selectedIds.length

    const appliedFilters = useMemo(() => {
        const chips: { key: string; label: string; onClear: () => void }[] = []

        if (category && category !== "all") chips.push({ key: "cat", label: `Category: ${category}`, onClear: () => setCategory("all") })
        if (breachedFilter !== "all") chips.push({
            key: "breach",
            label: breachedFilter === "breached" ? "Breached only" : "Not breached",
            onClear: () => setBreachedFilter("all"),
        })
        if (activityFilter !== "all") chips.push({
            key: "act",
            label: activityFilter === "active" ? "Active" : "Inactive",
            onClear: () => setActivityFilter("all"),
        })
        if (typeof minEmails === "number") chips.push({
            key: "min",
            label: `Min emails: ${minEmails}+`,
            onClear: () => setMinEmails(undefined),
        })
        if (hasDeletionRequest !== "all") chips.push({
            key: "hdr",
            label: hasDeletionRequest === "yes" ? "Has deletion request" : "No deletion request",
            onClear: () => setHasDeletionRequest("all"),
        })

        return chips
    }, [category, breachedFilter, activityFilter, minEmails, hasDeletionRequest, setCategory, setBreachedFilter, setActivityFilter, setMinEmails, setHasDeletionRequest])

    const resetFilters = () => {
        setQuery("")
        setCategory("all")
        setBreachedFilter("all")
        setActivityFilter("all")
        setMinEmails(undefined)
        setHasDeletionRequest("all")
        setPage(1)
    }

    const startBulkDeletion = async () => {
        if (gated) {
            toast(() => (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Upgrade to Professional to bulk delete.</p>
                    <Link href="/dashboard/billing">
                        <Button variant="secondary" size="sm">Upgrade</Button>
                    </Link>
                </div>
            ))
            return
        }

        if (selectedIds.length === 0) return

        try {
            setBulkLoading(true)
            const idsJoin = encodeURIComponent(selectedIds.join(","))
            router.push(`/dashboard/bulk_deletion?ids=${idsJoin}`)
        } finally {
            setBulkLoading(false)
        }
    }
    
    return (
        <div className="space-y-3">
            {/* Header controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#050505] p-4">
                <input
                    className="w-full max-w-md rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Search services..."
                    aria-label="Search services"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setPage(1)
                    }}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/15 bg-[#050505]"
                        onClick={() => setFiltersOpen(true)}
                    >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                    </Button>

                    <Button
                        size="sm"
                        className="bg-primary text-black hover:bg-primary/80"
                        disabled={gated || selectedCount === 0 || bulkLoading}
                        onClick={startBulkDeletion}
                        title={gated ? "Upgrade to use bulk deletion" : selectedCount === 0 ? "Select services first" : "Start bulk deletion"}
                    >
                        {bulkLoading ? (
                            <span className="flex items-center gap-2">
                                <Spinner /> Creating…
                            </span>
                        ) : (
                            <>Bulk delete{selectedCount ? ` (${selectedCount})` : ""}</>
                        )}
                    </Button>

                    {gated ? (
                        <Link href="/dashboard/billing">
                            <Button size="sm" variant="outline" className="border-white/15 bg-[#050505]">
                                <Lock className="h-4 w-4 mr-2" />
                                Upgrade
                            </Button>
                        </Link>
                    ) : null}

                    <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset filters">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Applied filter chips */}
            {appliedFilters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {appliedFilters.map((c) => (
                        <Badge key={c.key} variant="outline" className="text-xs border-white/10 bg-white/5">
                            {c.label}
                            <button
                                type="button"
                                className="ml-2 text-white/60 hover:text-white"
                                onClick={c.onClear}
                                aria-label={`Clear ${c.label}`}
                            >
                                ×
                            </button>
                        </Badge>
                    ))}
                </div>
            ) : null}

            {/* Count / gate banner */}
            <div className="rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-xs flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-muted-foreground">
                    GhostSweep found{" "}
                    <span className="text-white font-semibold">{totalCount.toLocaleString()}</span>{" "}
                    accounts matching your filters.
                    {gated ? <span className="ml-2 text-white/60">Upgrade to view the list and bulk delete.</span> : null}
                </div>

                {gated ? (
                    <Link href="/dashboard/billing">
                        <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                            Upgrade now
                        </Button>
                    </Link>
                ) : null}
            </div>

            {/* Table wrapper */}
            <div className="relative overflow-hidden rounded-md border border-border bg-[#050505] max-h-[500px] min-h-[300px] overflow-y-auto">
                {/* Gate overlay */}
                {gated && !isLoading ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                        <div className="max-w-sm rounded-xl border border-white/10 bg-black/70 p-4 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                                <Lock className="h-5 w-5 text-white/80" />
                            </div>
                            <p className="text-sm font-medium text-white">Accounts list is a Pro feature</p>
                            <p className="mt-1 text-xs text-white/60">
                                You can see the total accounts discovered, but the full list (and bulk deletion) is hidden on Free.
                            </p>
                            <div className="mt-3">
                                <Link href="/dashboard/billing">
                                    <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                                        Upgrade now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : null}

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
                                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="relative h-24 text-center text-sm text-muted-foreground">
                                    <Spinner className="absolute left-1/2 top-1/2 text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : gated ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                                    Upgrade to view discovered accounts.
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-white/5 data-[state=selected]:bg-white/10"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {gated ? (
                        <>0 of 0 row(s) selected.</>
                    ) : (
                        <>
                            {table.getSelectedRowModel().rows.length} of {table.getRowModel().rows.length} row(s) selected.
                        </>
                    )}
                </div>

                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => canPrev && setPage((p) => p - 1)}
                        disabled={!canPrev || isLoading}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => canNext && setPage((p) => p + 1)}
                        disabled={!canNext || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Filters Sheet */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
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
                                    setPage(1)
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
                                    setPage(1)
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
                                    setPage(1)
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
                                    setPage(1)
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
                                    setPage(1)
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
                                onClick={() => setFiltersOpen(false)}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}