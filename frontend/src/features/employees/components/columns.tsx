import { createColumnHelper } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, type dataTableFeatures } from "@/components/shared/data-table"
import { formatDate } from "@/lib/date"
import type { Employee } from "../types"
import { EmployeeStatusBadge } from "./employee-status-badge"

const columnHelper = createColumnHelper<typeof dataTableFeatures, Employee>()

export const employeeColumns = columnHelper.columns([
  columnHelper.accessor("employeeNumber", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee ID" />,
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-foreground">{info.getValue()}</span>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("fullName", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
    cell: (info) => {
      const employee = info.row.original
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{employee.fullName}</span>
          <span className="text-xs text-muted-foreground">{employee.email}</span>
        </div>
      )
    },
    enableSorting: true,
  }),
  columnHelper.accessor("department", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: (info) => <span>{info.getValue()}</span>,
    enableSorting: true,
  }),
  columnHelper.accessor("position", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Position" />,
    cell: (info) => {
      const isManager = info.row.original.isManager
      return (
        <div className="flex items-center gap-1.5">
          <span>{info.getValue()}</span>
          {isManager && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              Manager
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: true,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: (info) => <EmployeeStatusBadge status={info.getValue()} />,
    enableSorting: true,
  }),
  columnHelper.accessor("hireDate", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hire Date" />,
    cell: (info) => {
      const hireDate = info.getValue()
      return <span className="text-muted-foreground">{formatDate(hireDate)}</span>
    },
    enableSorting: true,
  }),
])
