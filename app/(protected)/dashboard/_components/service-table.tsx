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
import { Spinner } from "@/components/ui/spinner"

const formatDate = (dateString: string | null) => {
    // return example 6d ago, 2y ago, 3m ago
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    if (years > 0) return `${years}y ago`
    if (months > 0) return `${months}m ago`
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
}

interface Service {
    id: string
    user_id: string
    first_seen_at: string | null
    last_seen_at: string | null
    email_count: number | null
    is_breached: boolean | null
    service: {
        id: string
        name: string | null
        domain: string | null
        default_privacy_email: string | null
        category: string | null
    }
}

type Category =
    | "social"
    | "shopping"
    | "subscriptions"
    | "finance"
    | "developer"
    | "newsletters"
    | "travel"
    | "gaming"
    | "education"
    | "health"

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
            const {name, domain} = row.getValue("service") as {
                name: string | null
                domain: string | null
            } || {name: "Unknown", domain: "Unknown"}
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
        cell: ({row }) => {
            const {category} = row.getValue("service") as {category: string | null} || {category: null}
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
        header: "Breached",
        cell: ({ row }) => {
            const breached = row.original.is_breached
            if (breached === true) {
                return (
                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                        Breached
                    </span>
                )
            }
            if (breached === false) {
                return (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                        Safe
                    </span>
                )
            }
            return (
                <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400">
                    Unknown
                </span>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: () => (
            <Button variant="link" size="sm" className="px-0">
                View
            </Button>
        ),
    },
]

export default function ServiceTable() {
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState<Category | undefined>()
    const [page, setPage] = useState(1)
    // const [sorting, setSorting] = useState<SortingState>([])
    // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const { data, status } = useQuery({
        queryKey: ["services", query, category, page],
        queryFn: async (): Promise<Service[]> => {
            const res = await fetch(
                `/api/services?query=${encodeURIComponent(
                    query,
                )}&category=${encodeURIComponent(category || "")}&page=${page}`,
            )
            if (!res.ok) {
                throw new Error("Network response was not ok")
            }
            const json = await res.json()
            return json.services as Service[]
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            columnVisibility,
            rowSelection,
        },
        manualPagination: true, // we're paginating on the server with `page`
    })

    const reset = () => {
        setQuery("")
        setCategory(undefined)
        setPage(1)
    }

    const isLoading = status === "pending"

    return (
        <div className="mt-8 rounded-xl border border-white/10 bg-[#0f0f0f] p-5 max-h-[450px] overflow-scroll">
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
                                    className="h-24 text-sm text-muted-foreground flex items-center justify-center"
                                >
                                    <Spinner /> Loading services...
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

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}