import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  FolderGit2,
  Laptop,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/date"
import type { Employee } from "../types"
import { EmployeeInfoCard } from "./employee-info-card"
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
      <Card as="header" className="p-4 shadow-2xs sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
            <Avatar
              size="xl"
              className="size-14 shrink-0 ring-4 ring-primary/10 sm:size-16"
              aria-label={`Avatar for ${employee.fullName}`}
            >
              <AvatarFallback className="bg-primary/10 text-lg font-bold tracking-wider text-primary sm:text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-2xl">
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

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
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
            className="flex w-full flex-row items-center gap-2 sm:w-auto"
          >
            <a
              href={`mailto:${employee.email}`}
              aria-label={`Send email to ${employee.fullName} (${employee.email})`}
              className="flex-1 sm:flex-initial"
            >
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs sm:w-auto">
                <Mail className="size-3.5" aria-hidden="true" /> Send Email
              </Button>
            </a>
            {employee.phone && (
              <a
                href={`tel:${employee.phone}`}
                aria-label={`Call ${employee.fullName} at ${employee.phone}`}
                className="flex-1 sm:flex-initial"
              >
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs sm:w-auto">
                  <Phone className="size-3.5" aria-hidden="true" /> Call
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="flex flex-col gap-6">
        <TabsList
          aria-label="Employee detail sections"
          className="grid h-10 w-full grid-cols-4 p-1 sm:inline-flex sm:h-10 sm:w-auto"
        >
          <TabsTrigger
            value="overview"
            className="h-full gap-1.5 px-1 py-1.5 text-xs whitespace-nowrap sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Building2 className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="h-full gap-1.5 px-1 py-1.5 text-xs whitespace-nowrap sm:gap-2 sm:px-3 sm:text-sm"
          >
            <FolderGit2 className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
            <span>
              Projects<span className="hidden sm:inline"> & Team</span>
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="h-full gap-1.5 px-1 py-1.5 text-xs whitespace-nowrap sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Laptop className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
            <span>
              Assets<span className="hidden sm:inline"> & Inventory</span>
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="h-full gap-1.5 px-1 py-1.5 text-xs whitespace-nowrap sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Clock className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
            <span>
              Activity<span className="hidden sm:inline"> Log</span>
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" keepMounted className="mt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Employment Information */}
            <EmployeeInfoCard
              id="employment-details-title"
              title="Employment Details"
              icon={Building2}
            >
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Department</dt>
                  <dd className="text-right font-medium text-foreground">{employee.department}</dd>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Position</dt>
                  <dd className="flex items-center gap-1 text-right font-medium text-foreground">
                    <Briefcase className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {employee.position}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Status</dt>
                  <dd>
                    <EmployeeStatusBadge status={employee.status} />
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Hire Date</dt>
                  <dd className="flex items-center gap-1 text-right font-medium text-foreground">
                    <Calendar className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    <time dateTime={employee.hireDate}>{formatDate(employee.hireDate)}</time>
                  </dd>
                </div>
              </dl>
            </EmployeeInfoCard>

            {/* Role & Hierarchy */}
            <EmployeeInfoCard id="role-hierarchy-title" title="Role & Hierarchy" icon={Users}>
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Role Level</dt>
                  <dd className="text-right font-medium text-foreground">
                    {employee.isManager ? "Management" : "Individual Contributor"}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Direct Manager</dt>
                  <dd className="text-right font-mono text-sm font-medium text-foreground">
                    {employee.managerId ? (
                      <Link
                        href={`/employees/${employee.managerId}`}
                        className="text-primary hover:underline"
                      >
                        EMP-{employee.managerId.padStart(5, "0")}
                      </Link>
                    ) : (
                      <span className="font-sans text-xs text-muted-foreground">
                        None (Top-level)
                      </span>
                    )}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Assigned Project</dt>
                  <dd className="flex items-center gap-1 text-right font-mono font-medium text-foreground">
                    <FolderGit2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    PRJ-{employee.projectId}
                  </dd>
                </div>
              </dl>
            </EmployeeInfoCard>

            {/* Contact & Identification */}
            <EmployeeInfoCard
              id="contact-identification-title"
              title="Contact & Identification"
              icon={User}
              className="md:col-span-2 lg:col-span-1"
            >
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Employee ID</dt>
                  <dd className="text-right font-mono font-medium text-foreground">
                    {employee.employeeNumber}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">System ID</dt>
                  <dd className="text-right font-mono text-xs text-muted-foreground">
                    {employee.id}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <dt className="shrink-0 text-muted-foreground">Email</dt>
                  <dd className="min-w-0">
                    <a
                      href={`mailto:${employee.email}`}
                      className="block max-w-[170px] truncate text-right font-medium text-primary hover:underline sm:max-w-[280px] md:max-w-[200px] lg:max-w-[180px] xl:max-w-none"
                      title={employee.email}
                    >
                      {employee.email}
                    </a>
                  </dd>
                </div>

                {employee.phone && (
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Phone</dt>
                    <dd className="text-right">
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
            </EmployeeInfoCard>
          </div>
        </TabsContent>

        {/* Tab 2: Projects & Team */}
        <TabsContent value="projects" keepMounted className="mt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-border/60 p-0 pb-3">
                <FolderGit2 className="size-4 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                    Active Project Assignment
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Current operational allocation and project scope
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="flex flex-col gap-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Project Code</dt>
                    <dd className="font-mono font-medium text-foreground">
                      PRJ-{employee.projectId}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Department Scope</dt>
                    <dd className="text-right font-medium text-foreground">
                      {employee.department}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Role on Project</dt>
                    <dd className="text-right font-medium text-foreground">{employee.position}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Assignment Status</dt>
                    <dd>
                      <Badge
                        variant="outline"
                        className="border-success/30 bg-success/10 text-xs font-normal text-success"
                      >
                        Active Assignment
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-border/60 p-0 pb-3">
                <Users className="size-4 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                    Reporting & Team Hierarchy
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Supervision and organization structure
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="flex flex-col gap-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Leadership Role</dt>
                    <dd className="text-right font-medium text-foreground">
                      {employee.isManager ? "Team Manager / Lead" : "Individual Contributor"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Reporting To</dt>
                    <dd className="text-right font-mono text-sm font-medium text-foreground">
                      {employee.managerId ? (
                        <Link
                          href={`/employees/${employee.managerId}`}
                          className="text-primary hover:underline"
                        >
                          EMP-{employee.managerId.padStart(5, "0")}
                        </Link>
                      ) : (
                        <span className="font-sans text-xs text-muted-foreground">
                          Top-Level Executive
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Division</dt>
                    <dd className="text-right font-medium text-foreground">
                      {employee.department} Division
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Assets & Inventory */}
        <TabsContent value="assets" keepMounted className="mt-0">
          <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
            <CardHeader className="flex flex-col gap-1.5 border-b border-border/60 p-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="size-4 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                    Assigned Assets & Hardware
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Company equipment and resources assigned to {employee.fullName}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <Laptop
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-medium text-foreground">Standard Workstation Kit</span>
                    <span className="text-muted-foreground">
                      Assigned for {employee.position} role in {employee.department}
                    </span>
                    <span className="mt-1 font-mono text-[11px] text-muted-foreground">
                      Device Tag: AST-{employee.id.padStart(4, "0")}-LT
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-medium text-foreground">Security Keycard & Badge</span>
                    <span className="text-muted-foreground">
                      Facility access linked to {employee.employeeNumber}
                    </span>
                    <span className="mt-1 font-mono text-[11px] text-muted-foreground">
                      Badge ID: SEC-{employee.employeeNumber}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-end border-t border-border/60 p-0 pt-3">
              <Link href="/inventory" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs sm:w-auto">
                  Browse Inventory Catalog <ArrowRight className="size-3.5" aria-hidden="true" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 4: Activity Log */}
        <TabsContent value="activity" keepMounted className="mt-0">
          <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/60 p-0 pb-3">
              <Clock className="size-4 text-primary" aria-hidden="true" />
              <div>
                <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                  Activity & Profile History
                </CardTitle>
                <CardDescription className="text-xs">
                  Chronological record of employment status and changes
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ol className="relative flex flex-col gap-4 border-l border-border pl-4 text-xs">
                <li className="relative flex flex-col gap-1">
                  <div
                    className="absolute top-0.5 -left-[21px] size-2.5 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground">Account Created & Onboarded</span>
                  <span className="text-muted-foreground">
                    Officially joined {employee.department} as {employee.position}.
                  </span>
                  <time dateTime={employee.hireDate} className="text-[11px] text-muted-foreground">
                    {formatDate(employee.hireDate)}
                  </time>
                </li>

                <li className="relative flex flex-col gap-1">
                  <div
                    className="absolute top-0.5 -left-[21px] size-2.5 rounded-full bg-muted-foreground/40"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground">Project Allocation</span>
                  <span className="text-muted-foreground">
                    Assigned to project PRJ-{employee.projectId} as primary contributor.
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    PRJ-{employee.projectId}
                  </span>
                </li>

                <li className="relative flex flex-col gap-1">
                  <div
                    className="absolute top-0.5 -left-[21px] size-2.5 rounded-full bg-muted-foreground/40"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground">Record Status Verified</span>
                  <span className="text-muted-foreground">
                    Employee status recorded as {employee.status}.
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {employee.employeeNumber}
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </article>
  )
}
