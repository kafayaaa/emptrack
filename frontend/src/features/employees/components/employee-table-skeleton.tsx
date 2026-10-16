import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTableSkeleton } from "@/components/shared/data-table"

export interface EmployeeTableSkeletonProps {
  rowCount?: number
}

function BaseEmployeeTableSkeleton({ rowCount = 10 }: EmployeeTableSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Employee ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hire Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <DataTableSkeleton
              columnCount={6}
              rowCount={rowCount}
              cellWidths={["w-20", "w-44", "w-32", "w-36", "w-20", "w-28"]}
            />
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton Footer */}
      <div className="flex flex-col items-center justify-between gap-4 px-2 py-3 sm:flex-row">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-4 sm:gap-6">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const EmployeeTableSkeleton = React.memo(BaseEmployeeTableSkeleton)
