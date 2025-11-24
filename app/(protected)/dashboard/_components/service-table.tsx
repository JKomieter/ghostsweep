import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
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
import { Category, Service } from "@/types"
import { formatDate } from "@/utils/format-date"
import ServiceDetails from "./service-details"
import { calcPriorityScore, priorityLabel } from "@/utils/priority-score"



const categories: Category[] = [
    "social",
    "shopping",
    "subscriptions",
    "finance",
    "developer",
    "newsletters",
    "travel",
    "gaming",
    "education",
    "health",
]

type TableMeta = {
    onView: (service: Service) => void
}

export const columns: ColumnDef<Service>[] = [
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
            const { name, domain } = row.getValue("service") as {
                name: string | null
                domain: string | null
            } || { name: "Unknown", domain: "Unknown" }
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{name}</span>
                    {domain && (
                        <span className="text-xs text-muted-foreground">{domain}</span>
                    )}
                </div>
            )
        },
    },
    {
        id: "service_category",
        header: "Category",
        accessorKey: "service",
        cell: ({ row }) => {
            const { category } = row.getValue("service") as { category: string | null } || { category: null }
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
            // use row.original to access other fields like last_seen_at
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
            const score = calcPriorityScore(row.original);
            const { label, className } = priorityLabel(score);

            return (
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
                        {label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {score}
                    </span>
                </div>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMeta | undefined

            return (
                <Button variant="link" size="sm" className="px-0" onClick={() => {
                    meta?.onView(row.original)
                }}>
                    View
                </Button>
            )
        },
    },
]

const PAGE_SIZE = 20

export default function ServiceTable() {
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState<Category | undefined>()
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [page, setPage] = useState(1);
    const [serviceToViewId, setServiceToViewId] = useState<string>();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);


    const { data, status } = useQuery({
        queryKey: ["services", query, category, page],
        queryFn: async (): Promise<{ services: Service[], total: number }> => {
            const res = await fetch(
                `/api/user-services?query=${encodeURIComponent(
                    query,
                )}&category=${encodeURIComponent(category || "")}&page=${page}`,
            )
            if (!res.ok) {
                throw new Error("Network response was not ok")
            }
            const json = await res.json()
            return json
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    })

    const { data: plan } = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch('/api/plan', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch plan data');
            }

            return res.json();
        },
    })

    const isLoading = status === "pending";
    const isFree = plan?.current_plan === "free";

    const visibleCount = data?.services?.length ?? 0;
    const totalCount = data?.total ?? visibleCount;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // if free plan is capped to first page(s), lock next when hidden exists

    const hasHiddenServices = isFree && totalCount > visibleCount;
    const canPrev = page > 1;
    const canNext = !hasHiddenServices && page < totalPages;

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: data?.services || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,               // ✅ tell table how many pages exist
        state: {
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: page - 1,             // ✅ 0-based for TanStack
                pageSize: PAGE_SIZE,
            },
        },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        meta: {
            onView: (service: Service) => {
                setServiceToViewId(service.service.id);
                setIsDetailsOpen(true);
            },
        },
    });

    // ...

    const reset = () => {
        setQuery("")
        setCategory(undefined)
        setPage(1)
    }

    return (
        <div className="mt-8 rounded-xl border border-white/10 bg-[#050505] p-5 max-h-[450px] overflow-y-auto overflow-x-auto">
            <div className="flex items-center justify-between gap-6">
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
                <div className="flex items-center gap-2">
                    <Select
                        value={category ?? ""}
                        onValueChange={(value) => {
                            setCategory(value ? (value as Category) : undefined)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="max-w-[120px] sm:max-w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={reset}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-md border border-border">
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
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    Loading services...
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
                        <span className="font-semibold">{totalCount}</span>{" "}
                        services linked to your email. You’re seeing{" "}
                        <span className="font-semibold">{visibleCount}</span>{" "}
                        on the free plan.
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0 text-cyan-200 hover:text-black hover:bg-cyan-400"
                        onClick={() => {
                            // open upgrade modal / route to /pricing
                        }}
                    >
                        Upgrade to view all
                    </Button>
                </div>)}

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
                            if (!canPrev) return;
                            setPage((p) => p - 1);
                        }}
                        disabled={!canPrev || isLoading}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (!canNext) return;
                            setPage((p) => p + 1);
                        }}
                        disabled={!canNext || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
            <ServiceDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} serviceId={serviceToViewId} />
        </div>
    )
}