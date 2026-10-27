import * as React from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTableSkeleton } from "@/components/shared/data-table"

export interface EmployeeTableSkeletonProps {
  rowCount?: number
}

function BaseEmployeeTableSkeleton({ rowCount = 10 }: EmployeeTableSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        {/* Mobile Skeleton Cards */}
        <div className="flex flex-col gap-3 p-3 md:hidden">
          {Array.from({ length: Math.min(rowCount, 5) }).map((_, idx) => (
            <div
              key={`emp-mobile-skeleton-${idx}`}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-28 justify-self-end" />
                <Skeleton className="col-span-2 h-3.5 w-44" />
                <Skeleton className="col-span-2 h-3.5 w-36" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Skeleton className="size-4 rounded-[4px]" />
                </TableHead>
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
                columnCount={7}
                rowCount={rowCount}
                cellWidths={["w-10", "w-20", "w-44", "w-32", "w-36", "w-20", "w-28"]}
              />
            </TableBody>
          </Table>
        </div>
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
