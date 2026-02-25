import Input from "@/components/ui/input";
import { Search, Trash2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatDate } from "@/utils/format_date";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { RowSelectionState, VisibilityState, ColumnDef, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { toast } from "sonner";

type StatusFilter = "all" | "breached" | "unused" | "deleted";
type SortOption = "risk" | "alphabetical" | "oldest";

type DeletionRequestInfo = {
    status: string;
    created_at: string;
    completed_at: string | null;
};

type AccountRow = {
    id: string;
    service_id: string;
    name: string;
    domain: string;
    category: Category;
    logo_url: string | null;
    is_breached: boolean;
    email_count: number;
    first_seen_at: string | null;
    last_seen_at: string | null;
    status: string | null;
    email: string | null;
    is_whitelisted: boolean;
    days_since_last_seen: number | null;
    risk_level: "high" | "medium" | "low";
    deletion_request: DeletionRequestInfo | null;
};

interface AccountsTableProps {
    accountsResult: {
        accounts: AccountRow[];
        totalCount: number;
        breachedCount: number;
        unusedCount: number;
        deletedCount: number;
        privacyScore: number;
        plan: string;
        blurred: boolean;
        previewOnly: boolean;
        previewCount: number | null;
        availableEmails: string[];
    };
    accountsStatus: "pending" | "error" | "success";
    status: StatusFilter;
    setStatus: Dispatch<SetStateAction<StatusFilter>>;
    sort: SortOption;
    setSort: Dispatch<SetStateAction<SortOption>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    emailFilter: string;
    setEmailFilter: Dispatch<SetStateAction<string>>;
    whitelistedFilter: string; // "true", "false", or ""
    setWhitelistedFilter: Dispatch<SetStateAction<string>>;
}

export default function AccountsTable({
    accountsResult,
    accountsStatus,
    status,
    setStatus,
    sort: _sort,
    setSort: _setSort,
    search,
    setSearch,
    emailFilter,
    setEmailFilter,
    whitelistedFilter,
    setWhitelistedFilter,
}: AccountsTableProps) {
    // Suppress unused var warnings (can be used for sorting UI later)
    void _sort;
    void _setSort;
    const router = useRouter();
    const queryClient = useQueryClient();
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const { data: planData } = useQuery<{ current_plan: "free" | "buster" | "pro"; scan_credits_remaining?: number }>({
        queryKey: ["plan"],
        queryFn: async () => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan");
            return res.json();
        },
    });
    const upgradeLabel = "Upgrade to Pro →";

    const isLoading = accountsStatus === "pending";
    const accounts = accountsResult?.accounts || [];
    const availableEmails = accountsResult?.availableEmails || [];

    // Bulk actions mutation
    const markAsDeleted = useMutation({
        mutationFn: async (accountIds: string[]) => {
            const res = await fetch("/api/dashboard/accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: accountIds, status: "deleted" }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update accounts");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast.success(`Marked ${data.updated} account(s) as deleted`);
            setRowSelection({});
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const toggleWhitelist = useMutation({
        mutationFn: async ({ id, currentStatus }: { id: string, currentStatus: boolean }) => {
            const res = await fetch("/api/dashboard/accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [id], is_whitelisted: !currentStatus }),
            });

             if (!res.ok) {
                throw new Error("Failed to update whitelist status");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Updated whitelist status");
        },
        onError: () => toast.error("Failed to update whitelist status")
    });

    const hardDeleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/dashboard/accounts?id=${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete account");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Account permanently removed");
            setConfirmDeleteId(null);
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
            setConfirmDeleteId(null);
        },
    });

    const columns = useMemo<ColumnDef<AccountRow>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
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
            accessorKey: "name",
            header: "Account",
            cell: ({ row }) => {
                const name = row.original.name || row.original.domain;
                const email = row.original.email;
                const isBreached = row.original.is_breached;
                const daysSinceLastSeen = row.original.days_since_last_seen;
                const logo = row.original.logo_url;
                const isWhitelisted = row.original.is_whitelisted;
                
                return (
                    <div className="flex items-start gap-3">
                        {/* Logo */}
                        <div className="h-8 w-8 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {logo ? (
                                <Image src={logo} alt={name} width={32} height={32} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-white/40 text-xs font-bold">{name.substring(0, 1).toUpperCase()}</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{name}</span>
                                {isBreached && <div className="h-1.5 w-1.5 rounded-full bg-red-400" title="Breached" />}
                                {daysSinceLastSeen && daysSinceLastSeen > 365 && !isWhitelisted && <div className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Unused" />}
                                {isWhitelisted && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                                        Safe
                                    </span>
                                )}
                            </div>
                            {email && (
                                <div className="text-xs text-white/50">{email}</div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <span className="text-sm text-white/80">{row.original.category}</span>
            ),
        },
        {
            accessorKey: "risk_info",
            header: "Status",
            cell: ({ row }) => {
                const isBreached = row.original.is_breached;
                const daysSinceLastSeen = row.original.days_since_last_seen;
                const isWhitelisted = row.original.is_whitelisted;
                const deletionRequest = row.original.deletion_request;

                // Show deletion request status if exists
                if (deletionRequest) {
                    const drStatus = deletionRequest.status;
                    const statusConfig: Record<string, { label: string; color: string }> = {
                        drafted: { label: "Drafted", color: "text-slate-400" },
                        sent: { label: "Sent", color: "text-blue-400" },
                        received: { label: "Received", color: "text-blue-400" },
                        needs_verification: { label: "Needs Verification", color: "text-amber-400" },
                        in_progress: { label: "In Progress", color: "text-amber-400" },
                        completed: { label: "Deleted", color: "text-emerald-400" },
                        failed: { label: "Failed", color: "text-red-400" },
                        expired: { label: "Expired", color: "text-orange-400" },
                    };
                    const config = statusConfig[drStatus] || { label: drStatus, color: "text-white/60" };
                    return <span className={`text-sm ${config.color}`}>{config.label}</span>;
                }

                if (isWhitelisted) return <span className="text-emerald-400 text-sm">Trusted</span>;
                if (isBreached) return <span className="text-red-400 text-sm">Breached</span>;
                if (daysSinceLastSeen && daysSinceLastSeen > 365) return <span className="text-amber-400 text-sm">Unused</span>;

                return <span className="text-white/60 text-sm">Active</span>;
            },
        },
        {
            accessorKey: "last_activity",
            header: "Last Seen",
            cell: ({ row }) => {
                const lastSeen = row.original.last_seen_at;
                const daysSince = row.original.days_since_last_seen;

                if (!lastSeen) {
                    return <span className="text-white/40 text-sm">Unknown</span>;
                }

                if (daysSince !== null) {
                    if (daysSince === 0) return <span className="text-white/80 text-sm">Today</span>;
                    if (daysSince < 30) return <span className="text-white/80 text-sm">{daysSince}d ago</span>;
                    if (daysSince < 365) return <span className="text-white/80 text-sm">{Math.floor(daysSince / 30)}m ago</span>;
                    return <span className="text-white/80 text-sm">{Math.floor(daysSince / 365)}y ago</span>;
                }

                return <span className="text-white/80 text-sm">{formatDate(lastSeen)}</span>;
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const domain = row.original.domain;
                const isDeleted = row.original.status === "deleted";
                const isWhitelisted = row.original.is_whitelisted;
                const id = row.original.id;

                if (isDeleted) return null;

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-white/60 hover:text-white"
                            onClick={() => window.open(`https://${domain}`, "_blank")}
                        >
                            Visit
                        </Button>
                        <Button
                            variant="ghost" 
                            size="sm"
                            className={`text-xs ${isWhitelisted ? 'text-emerald-400' : 'text-white/40 hover:text-white'}`}
                            onClick={() => toggleWhitelist.mutate({ id, currentStatus: isWhitelisted })}
                        >
                            {isWhitelisted ? "Trusted" : "Whitelist"}
                        </Button>
                        {confirmDeleteId === id ? (
                            <Button
                                size="sm"
                                className="h-7 border border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 text-[10px] gap-1 px-2"
                                onClick={() => hardDeleteMutation.mutate(id)}
                                disabled={hardDeleteMutation.isPending}
                            >
                                <AlertTriangle className="h-3 w-3" />
                                Confirm
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-white/20 hover:text-red-400 hover:bg-red-500/5 px-1.5"
                                onClick={() => setConfirmDeleteId(id)}
                                title="Permanently remove this account"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [toggleWhitelist, confirmDeleteId, setConfirmDeleteId, hardDeleteMutation]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: accounts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            columnVisibility,
            rowSelection,
        },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
    });

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);

    return (
        <div className="space-y-4">
            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                <div className="flex flex-1 items-center gap-2">
                    {/* Search */}
                    <div className="relative max-w-sm w-full md:w-64">
                         <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Input
                        id="search"
                            placeholder="Search accounts..."
                            className="pl-8 bg-black/20 border-white/10 h-9 text-sm"
                            value={search}
                            onChange={setSearch}
                        />
                    </div>
                    
                    {/* Email Filter */}
                    <Select value={emailFilter} onValueChange={setEmailFilter}>
                        <SelectTrigger className="w-[180px] h-9 bg-black/20 border-white/10 text-xs">
                          <SelectValue placeholder="Filter by Email" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-white/10">
                            <SelectItem value="all">All Emails</SelectItem>
                            {availableEmails.map((email) => (
                                <SelectItem key={email} value={email}>{email}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3">
                    {/* Whitelist Toggle */}
                    <div className="flex items-center space-x-2 border-r border-white/10 pr-4 mr-2">
                        <Switch 
                            id="whitelist-mode" 
                            checked={whitelistedFilter === "true"}
                            onCheckedChange={(checked) => setWhitelistedFilter(checked ? "true" : "")}
                        />
                        <Label htmlFor="whitelist-mode" className="text-xs text-white/70">Show Trusted Only</Label>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-black/20 border-white/10 h-9">
                                {status === "all" ? "All Status" : 
                                 status === "breached" ? "Breached" :
                                 status === "unused" ? "Unused" : 
                                 status === "deleted" ? "Deletions" : status}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0A0A0A] border-white/10">
                            <DropdownMenuItem onClick={() => setStatus("all")}>All Accounts</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus("breached")}>Breached</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus("unused")}>Unused</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus("deleted")}>Deletions</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                     {selectedIds.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 h-9"
                            onClick={() => markAsDeleted.mutate(selectedIds)}
                            disabled={markAsDeleted.isPending}
                        >
                            {markAsDeleted.isPending ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                `Delete (${selectedIds.length})`
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-white/5 bg-white/2 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-white/5 hover:bg-white/2">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-white/40 font-medium">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Spinner className="h-6 w-6 text-white/40 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                        // Don't navigate if clicking on checkbox, buttons, or other interactive elements
                                        const target = e.target as HTMLElement;
                                        if (
                                            target.closest('button') || 
                                            target.closest('input[type="checkbox"]') ||
                                            target.closest('[role="checkbox"]')
                                        ) {
                                            return;
                                        }
                                        router.push(`/dashboard/accounts/${row.original.id}`);
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-white/40">
                                    No accounts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Free tier teaser */}
            {accountsResult?.previewOnly && (
                <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-transparent p-8 text-center">
                    <div className="text-5xl mb-4">👻</div>
                    <h3 className="text-xl text-white font-semibold mb-3">Your Digital Shadow Is Bigger</h3>
                    <p className="text-white/60 mb-2 max-w-md mx-auto">
                        You have <span className="text-purple-400 font-bold">{accountsResult.totalCount} accounts</span> scattered across the internet.
                        We&apos;re only showing {accountsResult.previewCount} of them.
                    </p>
                    {accountsResult.breachedCount > 0 && (
                        <p className="text-red-400 text-sm mb-4">
                            ⚠️ {accountsResult.breachedCount} account(s) found in data breaches
                        </p>
                    )}
                    <p className="text-white/40 text-sm mb-6">
                        Upgrade to see all accounts, delete them, and protect your privacy.
                    </p>
                    <Link href="/dashboard/billing?plan=monthly" className="inline-flex items-center justify-center rounded-lg bg-purple-500 hover:bg-purple-400 px-6 py-3 text-sm font-semibold text-white transition">
                        {upgradeLabel}
                    </Link>
                </div>
            )}
        </div>
    );
}