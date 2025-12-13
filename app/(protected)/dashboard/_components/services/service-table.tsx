import { Dispatch, SetStateAction, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Category, DeletionStatus, UserService } from "@/types"
import { formatDate } from "@/utils/format-date"
import { calcPriorityScore, priorityLabel } from "@/utils/priority-score"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"
import Link from "next/link"
import { BreachRecord } from "../breaches-table"
import { useRouter } from "next/navigation"

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
    "Other"
]

type TableMeta = {
    onView: (service: UserService) => void
}

export const columns: ColumnDef<UserService>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) => {
            const { name, domain, logo_url } =
                (row.getValue("service") as {
                    name: string | null
                    domain: string | null
                    logo_url: string | null
                }) || { name: "Unknown", domain: "Unknown", logo_url: null }

            return (
                <div className="flex flex-row items-start gap-1">
                    <div className="relative h-5 w-5 overflow-hidden rounded-full border">
                        {logo_url ? (
                            <Image
                                src={logo_url}
                                width={100}
                                height={100}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : null}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">{name}</span>
                        {domain && (
                            <span className="text-xs text-muted-foreground">{domain}</span>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        id: "service_category",
        header: "Category",
        accessorKey: "service",
        cell: ({ row }) => {
            const { category } =
                (row.getValue("service") as { category: string | null }) || {
                    category: null,
                }
            return (
                <span className="capitalize">
                    {category
                        ? category.charAt(0).toUpperCase() + category.slice(1)
                        : "Unknown"}
                </span>
            )
        },
    },
    {
        accessorKey: "email_count",
        header: "Activity",
        cell: ({ row }) => {
            const lastSeen = formatDate(row.original.last_seen_at)
            const count = row.original.email_count ?? 0
            return (
                <div className="text-left text-sm">
                    {lastSeen} · {count} emails
                </div>
            )
        },
    },
    {
        accessorKey: "is_breached",
        header: "Priority",
        cell: ({ row }) => {
            const score = calcPriorityScore(row.original)
            const { label, className } = priorityLabel(score)

            return (
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}
                    >
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
        cell: ({ row }) => {
            const requests = row.getValue("deletion_requests") as
                | {
                    id: string
                    status: DeletionStatus,
                    sent_at: string | null
                }[]
                | null

            if (!requests || requests.length === 0) {
                return (
                    <span className="text-xs text-muted-foreground">None</span>
                )
            }

            const pr = requests[0]

            const statusMap: Record<
                string,
                { label: string; className: string }
            > = {
                drafted: {
                    label: "Drafted",
                    className: "bg-zinc-500/10 text-zinc-300",
                },
                sent: {
                    label: "Sent",
                    className: "bg-blue-500/10 text-blue-300",
                },
                received: {
                    label: "Reply Received",
                    className: "bg-indigo-500/10 text-indigo-300",
                },
                needs_verification: {
                    label: "Needs Verification",
                    className: "bg-yellow-500/10 text-yellow-300",
                },
                in_progress: {
                    label: "In Progress",
                    className: "bg-purple-500/10 text-purple-300",
                },
                completed: {
                    label: "Completed",
                    className: "bg-emerald-500/10 text-emerald-300",
                },
                failed: {
                    label: "Failed",
                    className: "bg-red-500/10 text-red-300",
                },
                expired: {
                    label: "Expired",
                    className: "bg-orange-500/10 text-orange-300",
                },
            }

            const statusInfo = statusMap[pr.status]

            return (
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}
                    >
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

            return (
                <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => {
                        meta?.onView(row.original)
                    }}
                >
                    View
                </Button>
            )
        },
    },
]

const PAGE_SIZE = 20;

type BreachFilter = "all" | "breached" | "unbreached"

interface ServiceTableProps {
    userService: { services: UserService[]; total: number } | undefined;
    userServiceStatus: "pending" | "error" | "success";
    query: string;
    setQuery: Dispatch<SetStateAction<string>>;
    category: Category | undefined;
    setCategory: Dispatch<SetStateAction<Category | undefined>>;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    breachedFilter: BreachFilter;
    setBreachedFilter: Dispatch<SetStateAction<BreachFilter>>;
    breaches: { breaches: BreachRecord[], total: number } | undefined
}

export default function ServiceTable({
    userService,
    userServiceStatus,
    query,
    setQuery,
    category,
    setCategory,
    page,
    setPage,
    breachedFilter,
    setBreachedFilter,

}: ServiceTableProps) {
    
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const router = useRouter()
    
    // const [serviceToViewId, setServiceToViewId] = useState<string>()
    // const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    

    const { data: plan } = useQuery({
        queryKey: ["plan"],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch("/api/plan", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!res.ok) {
                throw new Error("Failed to fetch plan data")
            }

            return res.json()
        },
    })

    

    const isLoading = userServiceStatus === "pending"
    const isFree = plan?.current_plan === "free"

    const visibleCount = userService?.services?.length ?? 0
    const totalCount = userService?.total ?? visibleCount
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

    const hasHiddenServices = isFree && totalCount > visibleCount
    const canPrev = page > 1
    const canNext = !hasHiddenServices && page < totalPages

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: userService?.services || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        state: {
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: page - 1,
                pageSize: PAGE_SIZE,
            },
        },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        meta: {
            onView: (service: UserService) => {
                // setServiceToViewId(service.service.id)
                // setIsDetailsOpen(true)
                router.push(`/dashboard/services/${service.id}/details`)
            },
        },
    })

    const resetFilters = () => {
        setQuery("")
        setCategory(undefined)
        setBreachedFilter("all")
        setPage(1)
    }

    return (
        <div className="space-y-3">
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
                    {/* Category filter */}
                    <Select
                        value={category ?? ""}
                        onValueChange={(value) => {
                            setCategory(value ? (value as Category) : undefined)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="h-8 w-[150px] text-xs">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="All">All categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Breach filter */}
                    <Select
                        value={breachedFilter}
                        onValueChange={(value) => {
                            setBreachedFilter(value as "all" | "breached" | "unbreached")
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="h-8 w-[150px] text-xs">
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

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetFilters}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-[#050505] max-h-[400px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="relative h-24 text-center text-sm text-muted-foreground"
                                >
                                    <Spinner className="absolute left-1/2 top-1/2 text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {hasHiddenServices && (
                <div className="mt-3 flex flex-col gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-cyan-100">
                        GhostSweep found{" "}
                        <span className="font-semibold">{totalCount}</span> services
                        linked to your email. You’re seeing{" "}
                        <span className="font-semibold">{visibleCount}</span> on the
                        free plan.
                    </p>
                    <Link href="/dashboard/billing">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0 text-cyan-200 hover:bg-cyan-400 hover:text-black"
                    >
                        Upgrade to view all
                    </Button>
                    </Link>
                </div>
            )}

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>

                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (!canPrev) return
                            setPage((p) => p - 1)
                        }}
                        disabled={!canPrev || isLoading}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (!canNext) return
                            setPage((p) => p + 1)
                        }}
                        disabled={!canNext || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* <ServiceDetails
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                serviceId={serviceToViewId}
            /> */}
        </div>
    )
}