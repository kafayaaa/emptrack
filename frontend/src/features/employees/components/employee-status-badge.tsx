import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import type { EmployeeStatus } from "../types"

export const EMPLOYEE_STATUS_CONFIG: Record<
  EmployeeStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  active: {
    label: "Active",
    variant: "success",
  },
  on_leave: {
    label: "On Leave",
    variant: "warning",
  },
  inactive: {
    label: "Inactive",
    variant: "destructive",
  },
}

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus | string
  className?: string
}

export function EmployeeStatusBadge({ status, className }: EmployeeStatusBadgeProps) {
  const config =
    status in EMPLOYEE_STATUS_CONFIG
      ? EMPLOYEE_STATUS_CONFIG[status as EmployeeStatus]
      : {
          label: status,
          variant: "outline" as const,
        }

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  )
}
