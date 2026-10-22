import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  FolderGit2,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/date"
import type { Employee } from "../types"
import { EmployeeStatusBadge } from "./employee-status-badge"

export interface EmployeeDetailViewProps {
  employee: Employee
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "EM"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function EmployeeDetailView({ employee }: EmployeeDetailViewProps) {
  const initials = getInitials(employee.fullName)

  return (
    <article data-testid={`employee-detail-${employee.id}`} className="flex flex-col gap-6">
      {/* Back button navigation */}
      <nav aria-label="Back navigation">
        <Link href="/employees">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Employees
          </Button>
        </Link>
      </nav>

      {/* Hero profile card */}
      <header className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold tracking-wider text-primary ring-4 ring-primary/5"
            >
              {initials}
            </div>

            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {employee.fullName}
                </h1>
                {employee.isManager && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium"
                  >
                    <ShieldCheck className="size-3.5 text-primary" />
                    Manager
                  </Badge>
                )}
                <EmployeeStatusBadge status={employee.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono font-medium text-foreground">
                  {employee.employeeNumber}
                </span>
                <span aria-hidden="true">•</span>
                <span>{employee.position}</span>
                <span aria-hidden="true">•</span>
                <span>{employee.department}</span>
              </div>
            </div>
          </div>

          {/* Quick contact actions */}
          <div
            role="group"
            aria-label="Contact actions"
            className="flex flex-wrap items-center gap-2"
          >
            <a
              href={`mailto:${employee.email}`}
              aria-label={`Send email to ${employee.fullName} (${employee.email})`}
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Mail className="size-3.5" aria-hidden="true" /> Send Email
              </Button>
            </a>
            {employee.phone && (
              <a
                href={`tel:${employee.phone}`}
                aria-label={`Call ${employee.fullName} at ${employee.phone}`}
              >
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Phone className="size-3.5" aria-hidden="true" /> Call
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Detail grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Employment Information */}
        <section
          aria-labelledby="employment-details-title"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs"
        >
          <header className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Building2 className="size-4 text-primary" aria-hidden="true" />
            <h2 id="employment-details-title" className="text-sm font-semibold text-foreground">
              Employment Details
            </h2>
          </header>

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Department</dt>
              <dd className="text-right font-medium text-foreground">{employee.department}</dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Position</dt>
              <dd className="flex items-center gap-1 text-right font-medium text-foreground">
                <Briefcase className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {employee.position}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <EmployeeStatusBadge status={employee.status} />
              </dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Hire Date</dt>
              <dd className="flex items-center gap-1 text-right font-medium text-foreground">
                <Calendar className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <time dateTime={employee.hireDate}>{formatDate(employee.hireDate)}</time>
              </dd>
            </div>
          </dl>
        </section>

        {/* Role & Hierarchy */}
        <section
          aria-labelledby="role-hierarchy-title"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs"
        >
          <header className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Users className="size-4 text-primary" aria-hidden="true" />
            <h2 id="role-hierarchy-title" className="text-sm font-semibold text-foreground">
              Role & Hierarchy
            </h2>
          </header>

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Role Level</dt>
              <dd className="font-medium text-foreground">
                {employee.isManager ? "Management" : "Individual Contributor"}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Direct Manager</dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {employee.managerId ? (
                  <Link
                    href={`/employees/${employee.managerId}`}
                    className="text-primary hover:underline"
                  >
                    EMP-{employee.managerId.padStart(5, "0")}
                  </Link>
                ) : (
                  <span className="font-sans text-xs text-muted-foreground">None (Top-level)</span>
                )}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Assigned Project</dt>
              <dd className="flex items-center gap-1 font-mono font-medium text-foreground">
                <FolderGit2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                PRJ-{employee.projectId}
              </dd>
            </div>
          </dl>
        </section>

        {/* Contact & Identification */}
        <section
          aria-labelledby="contact-identification-title"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs md:col-span-2 lg:col-span-1"
        >
          <header className="flex items-center gap-2 border-b border-border/60 pb-3">
            <User className="size-4 text-primary" aria-hidden="true" />
            <h2 id="contact-identification-title" className="text-sm font-semibold text-foreground">
              Contact & Identification
            </h2>
          </header>

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Employee ID</dt>
              <dd className="font-mono font-medium text-foreground">{employee.employeeNumber}</dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">System ID</dt>
              <dd className="font-mono text-xs text-muted-foreground">{employee.id}</dd>
            </div>

            <div className="flex items-start justify-between gap-2">
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a
                  href={`mailto:${employee.email}`}
                  className="block max-w-[180px] truncate font-medium text-primary hover:underline"
                  title={employee.email}
                >
                  {employee.email}
                </a>
              </dd>
            </div>

            {employee.phone && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <a
                    href={`tel:${employee.phone}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {employee.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </article>
  )
}
