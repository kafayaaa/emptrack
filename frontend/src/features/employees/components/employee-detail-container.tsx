"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, RefreshCw, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api-client"
import { useEmployee } from "../hooks"
import { EmployeeDetailView } from "./employee-detail-view"
import { EmployeeDetailSkeleton } from "./employee-detail-skeleton"

export interface EmployeeDetailContainerProps {
  id: string
}

export function EmployeeDetailContainer({ id }: EmployeeDetailContainerProps) {
  const { data: employee, isLoading, isError, error, refetch, isFetching } = useEmployee(id)

  if (isLoading) {
    return <EmployeeDetailSkeleton />
  }

  if (isError || !employee) {
    const isNotFound =
      (error instanceof ApiError && error.status === 404) ||
      error?.message?.toLowerCase().includes("not found")

    if (isNotFound) {
      return (
        <div
          data-testid="employee-detail-not-found"
          role="region"
          aria-label="Employee not found notice"
          className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center sm:min-h-[400px] sm:p-8"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-14">
            <UserX className="size-6 sm:size-7" />
          </div>
          <h1 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
            Employee Not Found
          </h1>
          <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm">
            We couldn&apos;t find an employee with ID{" "}
            <span className="font-mono font-medium text-foreground">&quot;{id}&quot;</span>. The
            record might have been removed or the ID might be incorrect.
          </p>
          <div className="mt-6 w-full sm:w-auto">
            <Link href="/employees" className="w-full sm:w-auto">
              <Button variant="default" size="sm" className="w-full gap-2 sm:w-auto">
                <ArrowLeft className="size-4" />
                Back to Employees List
              </Button>
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div
        data-testid="employee-detail-error"
        role="alert"
        className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center sm:min-h-[400px] sm:p-8"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:size-14">
          <AlertCircle className="size-6 sm:size-7" />
        </div>
        <h1 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
          Unable to Load Employee Details
        </h1>
        <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm">
          {error?.message || "An unexpected error occurred while communicating with the server."}
        </p>
        <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Try Again
          </Button>
          <Link href="/employees" className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="size-4" />
              Back to Employees
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <EmployeeDetailView employee={employee} />
}
