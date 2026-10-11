import * as React from "react"
import { Metadata } from "next"
import { EmployeeTable } from "@/features/employees"
import { DataTableSkeleton } from "@/components/shared/data-table"

export const metadata: Metadata = {
  title: "Employees",
}

export default function EmployeePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees</h1>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all organization members and their employment details.
        </p>
      </div>

      <React.Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}>
        <EmployeeTable />
      </React.Suspense>
    </div>
  )
}
