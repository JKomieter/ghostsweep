import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

// Varied widths so placeholder rows read like real data, not a solid block.
const WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-2/5", "w-5/6"]

/** Placeholder <TableRow>s to drop into a <TableBody> while data loads. */
export function TableRowsSkeleton({
  rows = 5,
  columns,
}: {
  rows?: number
  columns: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent" aria-hidden="true">
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c} className="py-3.5">
              <Skeleton
                className={`h-4 ${c === 0 ? "w-5/6" : WIDTHS[(r + c) % WIDTHS.length]}`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
      <TableRow className="sr-only">
        <TableCell colSpan={columns} role="status">Loading</TableCell>
      </TableRow>
    </>
  )
}
