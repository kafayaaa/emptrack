import * as React from "react"
import { Building2, Calendar, Mail, Phone, ShieldCheck, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/date"
import type { Employee } from "../types"
import { EmployeeStatusBadge } from "./employee-status-badge"

export interface EmployeeMobileCardProps {
  employee: Employee
}

function BaseEmployeeMobileCard({ employee }: EmployeeMobileCardProps) {
  return (
    <div
      data-testid={`employee-mobile-card-${employee.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-2xs transition-colors hover:border-border/80"
    >
      {/* Top Header: Name, Employee ID, and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {employee.fullName}
              </span>
              {employee.isManager && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-1.5 py-0 text-[10px] font-medium"
                >
                  <ShieldCheck className="size-3 text-primary" />
                  Manager
                </Badge>
              )}
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {employee.employeeNumber}
            </span>
          </div>
        </div>
        <EmployeeStatusBadge status={employee.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2 text-xs">
        <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <Building2 className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span className="truncate" title={employee.department}>
            {employee.department}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-1.5 justify-self-end text-muted-foreground">
          <span className="truncate font-medium text-foreground" title={employee.position}>
            {employee.position}
          </span>
        </div>

        <div className="col-span-2 flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
          <a
            href={`mailto:${employee.email}`}
            className="truncate transition-colors hover:text-foreground hover:underline"
          >
            {employee.email}
          </a>
        </div>

        {employee.phone && (
          <div className="col-span-2 flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <Phone className="size-3.5 shrink-0 text-muted-foreground/70" />
            <a
              href={`tel:${employee.phone}`}
              className="truncate transition-colors hover:text-foreground hover:underline"
            >
              {employee.phone}
            </a>
          </div>
        )}

        <div className="col-span-2 flex min-w-0 items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground/80">
          <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span>Hired on {formatDate(employee.hireDate)}</span>
        </div>
      </div>
    </div>
  )
}

export const EmployeeMobileCard = React.memo(BaseEmployeeMobileCard)
