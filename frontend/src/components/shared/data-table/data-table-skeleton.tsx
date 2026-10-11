import * as React from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
  cellWidths?: string[]
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
  cellWidths = ["w-24", "w-40", "w-48", "w-32", "w-28", "w-20"],
}: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`data-table-skeleton-row-${rowIndex}`}>
          {Array.from({ length: columnCount }).map((_, colIndex) => {
            const widthClass = cellWidths[colIndex % cellWidths.length] ?? "w-28"

            return (
              <TableCell key={`data-table-skeleton-cell-${rowIndex}-${colIndex}`}>
                <Skeleton className={`h-5 ${widthClass} max-w-full`} />
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </>
  )
}
