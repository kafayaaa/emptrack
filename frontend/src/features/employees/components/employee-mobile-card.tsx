import * as React from "react"
import Link from "next/link"
import { Building2, Calendar, Mail, Phone, ShieldCheck, User } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/date"
import type { Employee } from "../types"
import { usePrefetchEmployee } from "../hooks"
import { EmployeeStatusBadge } from "./employee-status-badge"

export interface EmployeeMobileCardProps {
  employee: Employee
  isSelected?: boolean
  onSelectChange?: (selected: boolean) => void
}

function BaseEmployeeMobileCard({
  employee,
  isSelected = false,
  onSelectChange,
}: EmployeeMobileCardProps) {
  const { prefetchEmployee } = usePrefetchEmployee()

  return (
    <div
      data-testid={`employee-mobile-card-${employee.id}`}
      data-selected={isSelected ? "true" : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-2xs transition-colors",
        isSelected
          ? "border-primary/80 bg-primary/5 ring-1 ring-primary/30"
          : "border-border hover:border-border/80",
      )}
    >
      {/* Top Header: Name, Employee ID, and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          {onSelectChange ? (
            <div className="flex shrink-0 pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectChange}
                aria-label={`Pilih karyawan ${employee.fullName}`}
                data-testid={`employee-mobile-checkbox-${employee.id}`}
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <User className="size-4" />
            </div>
          )}
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/employees/${employee.id}`}
                onMouseEnter={() => prefetchEmployee(employee.id)}
                onFocus={() => prefetchEmployee(employee.id)}
                onTouchStart={() => prefetchEmployee(employee.id)}
                className="truncate text-sm font-semibold text-foreground transition-colors hover:text-primary hover:underline"
              >
                {employee.fullName}
              </Link>
              {employee.isManager && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-1.5 py-0 text-[10px] font-medium"
                >
                  <ShieldCheck className="size-3 text-primary" aria-hidden="true" />
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
          <Building2 className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
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
          <Mail className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
          <a
            href={`mailto:${employee.email}`}
            aria-label={`Send email to ${employee.fullName} (${employee.email})`}
            className="truncate transition-colors hover:text-foreground hover:underline"
          >
            {employee.email}
          </a>
        </div>

        {employee.phone && (
          <div className="col-span-2 flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <Phone className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
            <a
              href={`tel:${employee.phone}`}
              aria-label={`Call ${employee.fullName} at ${employee.phone}`}
              className="truncate transition-colors hover:text-foreground hover:underline"
            >
              {employee.phone}
            </a>
          </div>
        )}

        <div className="col-span-2 flex min-w-0 items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground/80">
          <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
          <span>Hired on {formatDate(employee.hireDate)}</span>
        </div>
      </div>
    </div>
  )
}

export const EmployeeMobileCard = React.memo(BaseEmployeeMobileCard)
